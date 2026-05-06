<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Exceptions\DisplayException;

class TicketController extends Controller
{
    /**
     * @var array<int, array{name: string, color: string}>
     */
    private const STATUSES = [
        ['name' => 'Waiting for admin...', 'color' => 'info'],
        ['name' => 'Waiting for client...', 'color' => 'warning'],
        ['name' => 'Closed', 'color' => 'danger'],
    ];

    /**
     * @var array<int, array{name: string, color: string}>
     */
    private const PRIORITIES = [
        ['name' => 'Low', 'color' => 'primary'],
        ['name' => 'Medium', 'color' => 'warning'],
        ['name' => 'High', 'color' => 'success'],
    ];

    public function __invoke(): JsonResponse
    {
        $tickets = $this->baseTicketQuery()
            ->orderByDesc('tickets.updated_at')
            ->get()
            ->map(fn ($ticket) => $this->transformTicket($ticket));

        return new JsonResponse([
            'data' => $tickets,
        ]);
    }

    public function meta(): JsonResponse
    {
        return new JsonResponse([
            'data' => [
                'categories' => DB::table('ticket_categories')->orderBy('name')->get(),
                'statuses' => self::STATUSES,
                'priorities' => self::PRIORITIES,
            ],
        ]);
    }

    public function show(int $ticketId): JsonResponse
    {
        $ticket = $this->baseTicketQuery()
            ->where('tickets.id', '=', $ticketId)
            ->first();

        abort_if(!$ticket, 404, 'Ticket not found.');

        return new JsonResponse([
            'data' => [
                'ticket' => $this->transformTicket($ticket),
                'messages' => DB::table('ticket_messages')
                    ->select(['ticket_messages.*', 'users.name_first as firstname', 'users.name_last as lastname'])
                    ->where('ticket_id', '=', $ticketId)
                    ->leftJoin('users', 'users.id', '=', 'ticket_messages.user_id')
                    ->orderBy('sent_at')
                    ->get(),
                'categories' => DB::table('ticket_categories')->orderBy('name')->get(),
                'statuses' => self::STATUSES,
                'priorities' => self::PRIORITIES,
            ],
        ]);
    }

    public function updateStatus(Request $request, int $ticketId): JsonResponse
    {
        $ticket = DB::table('tickets')->where('id', '=', $ticketId)->first();
        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        $data = $request->validate([
            'status' => ['required', 'integer', 'min:0', 'max:' . (count(self::STATUSES) - 1)],
        ]);

        DB::table('tickets')->where('id', '=', $ticketId)->update([
            'status_id' => $data['status'],
            'updated_at' => Carbon::now(),
        ]);

        return $this->show($ticketId);
    }

    public function reply(Request $request, int $ticketId): JsonResponse
    {
        $ticket = DB::table('tickets')->where('id', '=', $ticketId)->first();
        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        if ((int) $ticket->status_id === 2) {
            throw new DisplayException('Ticket is closed.');
        }

        $data = $request->validate([
            'message' => ['required', 'string'],
        ]);

        DB::table('tickets')->where('id', '=', $ticketId)->update([
            'status_id' => 1,
            'updated_at' => Carbon::now(),
        ]);

        DB::table('ticket_messages')->insert([
            'ticket_id' => $ticketId,
            'user_id' => Auth::id(),
            'message' => trim($data['message']),
            'sent_at' => Carbon::now(),
        ]);

        return $this->show($ticketId);
    }

    public function createCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:40'],
        ]);

        $id = DB::table('ticket_categories')->insertGetId([
            'name' => trim(strip_tags($data['name'])),
        ]);

        return new JsonResponse([
            'data' => DB::table('ticket_categories')->where('id', '=', $id)->first(),
        ], JsonResponse::HTTP_CREATED);
    }

    public function updateCategory(Request $request, int $categoryId): JsonResponse
    {
        $category = DB::table('ticket_categories')->where('id', '=', $categoryId)->first();
        if (!$category) {
            throw new DisplayException('Category not found.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:40'],
        ]);

        DB::table('ticket_categories')->where('id', '=', $categoryId)->update([
            'name' => trim(strip_tags($data['name'])),
        ]);

        return new JsonResponse([
            'data' => DB::table('ticket_categories')->where('id', '=', $categoryId)->first(),
        ]);
    }

    public function deleteCategory(int $categoryId): JsonResponse
    {
        $category = DB::table('ticket_categories')->where('id', '=', $categoryId)->first();
        if (!$category) {
            throw new DisplayException('Category not found.');
        }

        $used = DB::table('tickets')->where('category_id', '=', $categoryId)->exists();
        if ($used) {
            throw new DisplayException('Category is used by tickets.');
        }

        DB::table('ticket_categories')->where('id', '=', $categoryId)->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    private function baseTicketQuery()
    {
        return DB::table('tickets')
            ->select(['tickets.*', 'ticket_categories.name as category', 'users.name_first as firstname', 'users.name_last as lastname', 'servers.name as serverName'])
            ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
            ->leftJoin('users', 'users.id', '=', 'tickets.user_id')
            ->leftJoin('servers', 'servers.id', '=', 'tickets.related_server_id');
    }

    private function transformTicket(object $ticket): array
    {
        $status = self::STATUSES[(int) $ticket->status_id] ?? ['name' => 'Unknown', 'color' => 'secondary'];
        $priority = self::PRIORITIES[(int) $ticket->priority_id] ?? ['name' => 'Unknown', 'color' => 'secondary'];

        return [
            ...(array) $ticket,
            'status' => $status['name'],
            'status_color' => $status['color'],
            'priority' => $priority['name'],
            'priority_color' => $priority['color'],
        ];
    }
}
