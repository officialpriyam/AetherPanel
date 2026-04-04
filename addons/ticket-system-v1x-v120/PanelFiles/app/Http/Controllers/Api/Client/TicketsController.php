<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Requests\Api\Client\TicketsRequest;
use \Pterodactyl\Http\Controllers\Admin\TicketsController as AdminTicketController;

class TicketsController extends ClientApiController
{
    /**
     * @param TicketsRequest $request
     * @return array
     */
    public function index(TicketsRequest $request)
    {
        return [
            'success' => true,
            'data' => [
                'tickets' => DB::table('tickets')
                    ->select(['tickets.*', 'ticket_categories.name as category', 'servers.name as serverName'])
                    ->where('tickets.user_id', '=', Auth::user()->id)
                    ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
                    ->leftJoin('servers', 'servers.id', '=', 'tickets.related_server_id')
                    ->orderBy('updated_at', 'DESC')
                    ->get(),
                'categories' => DB::table('ticket_categories')->get(),
                'statuses' => AdminTicketController::$statuses,
                'priorities' => AdminTicketController::$priorities,
                'servers' => DB::table('servers')->select(['id', 'name'])->whereIn('id', Auth::user()->accessibleServers()->pluck('id')->all())->get(),
            ],
        ];
    }

    /**
     * @param TicketsRequest $request
     * @return bool[]
     * @throws DisplayException
     */
    public function create(TicketsRequest $request)
    {
        $this->validate($request, [
            'subject' => 'required|string|max:50',
            'message' => 'required|string|max:2000',
            'priority' => 'required',
            'category' => 'required|exists:ticket_categories,id',
        ]);

        if (!isset(AdminTicketController::$priorities[$request->input('priority')])) {
            throw new DisplayException('Invalid priority');
        }

        if ($request->input('relatedServer', 0) != 0 && !in_array((int) $request->input('relatedServer'), Auth::user()->accessibleServers()->pluck('id')->all())) {
            throw new DisplayException('Related server not found.');
        }

        $ticketId = DB::table('tickets')->insertGetId([
            'user_id' => Auth::user()->id,
            'subject' => trim(strip_tags($request->input('subject'))),
            'status_id' => 0,
            'priority_id' => (int) $request->input('priority'),
            'category_id' => (int) $request->input('category'),
            'related_server_id' => ((int) $request->input('relatedServer') == 0 ? null : (int) $request->input('relatedServer')),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        DB::table('ticket_messages')->insert([
            'ticket_id' => $ticketId,
            'user_id' => Auth::user()->id,
            'message' => trim(strip_tags($request->input('message'))),
            'sent_at' => Carbon::now(),
        ]);

        return ['success' => true];
    }

    /**
     * @param TicketsRequest $request
     * @param $ticketId
     * @return array
     * @throws DisplayException
     */
    public function view(TicketsRequest $request, $ticketId)
    {
        $ticket = DB::table('tickets')
            ->select(['tickets.*', 'ticket_categories.name as category', 'servers.name as serverName', 'servers.uuidShort as uuidShort'])
            ->where('tickets.id', '=', (int) $ticketId)
            ->where('tickets.user_id', '=', Auth::user()->id)
            ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
            ->leftJoin('servers', 'servers.id', '=', 'tickets.related_server_id')
            ->first();

        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        return [
            'success' => true,
            'data' => [
                'ticket' => $ticket,
                'messages' => DB::table('ticket_messages')
                    ->select(['ticket_messages.*', 'users.name_first as firstname', 'users.name_last as lastname'])
                    ->where('ticket_id', '=', $ticket->id)
                    ->leftJoin('users', 'users.id', '=', 'ticket_messages.user_id')
                    ->orderBy('sent_at', 'DESC')
                    ->get(),
                'statuses' => AdminTicketController::$statuses,
                'priorities' => AdminTicketController::$priorities,
            ],
        ];
    }

    /**
     * @param TicketsRequest $request
     * @param $ticketId
     * @return bool[]
     * @throws DisplayException
     */
    public function message(TicketsRequest $request, $ticketId)
    {
        $ticket = DB::table('tickets')->where('id', '=', (int) $ticketId)->where('user_id', '=', Auth::user()->id)->first();
        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        if ($ticket->status_id == 2) {
            throw new DisplayException('Ticket is closed.');
        }

        $this->validate($request, [
            'message' => 'required|string',
        ]);

        DB::table('ticket_messages')->insert([
            'user_id' => Auth::user()->id,
            'ticket_id' => $ticket->id,
            'message' => trim(strip_tags($request->input('message'))),
            'sent_at' => Carbon::now(),
        ]);

        DB::table('tickets')->where('id', '=', $ticket->id)->update([
            'status_id' => 0,
            'updated_at' => Carbon::now(),
        ]);

        return ['success' => true];
    }
}
