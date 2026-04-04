<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\Facades\Alert;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Controllers\Controller;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TicketsController extends Controller
{
    /**
     * @var \string[][]
     */
    public static $statuses = [
        [
            'name' => 'Waiting for admin...',
            'color' => 'info',
        ],
        [
            'name' => 'Waiting for client...',
            'color' => 'warning',
        ],
        [
            'name' => 'Closed',
            'color' => 'danger',
        ],
    ];

    /**
     * @var \string[][]
     */
    public static $priorities = [
        [
            'name' => 'Low',
            'color' => 'primary',
        ],
        [
            'name' => 'Medium',
            'color' => 'warning',
        ],
        [
            'name' => 'High',
            'color' => 'success',
        ],
    ];

    /**
     * @param Request $request
     * @param $categoryId
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function index(Request $request, $categoryId = 0)
    {
        return view('admin.tickets.list', [
            'tickets' => DB::table('tickets')
                ->select(['tickets.*', 'ticket_categories.name as category', 'users.name_first as firstname', 'users.name_last as lastname', 'servers.name as serverName'])
                ->where(function ($table) use ($request) {
                    if (!empty($request->input('status', ''))) {
                        return $table->where('status_id', '=', (int) $request->input('status') - 1);
                    } else {
                        return $table;
                    }
                })
                ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
                ->leftJoin('users', 'users.id', '=', 'tickets.user_id')
                ->leftJoin('servers', 'servers.id', '=', 'tickets.related_server_id')
                ->orderBy('updated_at', 'DESC')
                ->paginate(10),
            'categories' => DB::table('ticket_categories')->get(),
            'statuses' => TicketsController::$statuses,
            'priorities' => TicketsController::$priorities,
            'createCategory' => Route::currentRouteName() == 'admin.tickets.categories.create',
            'editCategory' => DB::table('ticket_categories')->where('id', '=', (int) $categoryId)->first(),
        ]);
    }

    /**
     * @param Request $request
     * @param $ticketId
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function view(Request $request, $ticketId)
    {
        $ticket = DB::table('tickets')
            ->select(['tickets.*', 'ticket_categories.name as category', 'users.name_first as firstname', 'users.name_last as lastname', 'servers.name as serverName'])
            ->where('tickets.id', '=', (int) $ticketId)
            ->leftJoin('ticket_categories', 'tickets.category_id', '=', 'ticket_categories.id')
            ->leftJoin('users', 'users.id', '=', 'tickets.user_id')
            ->leftJoin('servers', 'servers.id', '=', 'tickets.related_server_id')
            ->first();

        if (!$ticket) {
            throw new NotFoundHttpException('Ticket not found');
        }

        return view('admin.tickets.view', [
            'ticket' => $ticket,
            'messages' => DB::table('ticket_messages')
                ->select(['ticket_messages.*', 'users.name_first as firstname', 'users.name_last as lastname'])
                ->where('ticket_id', '=', $ticket->id)
                ->leftJoin('users', 'users.id', '=', 'ticket_messages.user_id')
                ->orderBy('sent_at', 'DESC')
                ->get(),
            'statuses' => TicketsController::$statuses,
            'priorities' => TicketsController::$priorities,
        ]);
    }

    /**
     * @param Request $request
     * @param $ticketId
     * @return \Illuminate\Http\RedirectResponse
     * @throws DisplayException
     */
    public function status(Request $request, $ticketId)
    {
        $ticket = DB::table('tickets')->where('id', '=', (int) $ticketId)->first();
        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        $this->validate($request, [
            'status' => 'required|integer',
        ]);

        if (!isset(TicketsController::$statuses[$request->input('status')])) {
            throw new DisplayException('Invalid status.');
        }

        DB::table('tickets')->where('id', '=', $ticket->id)->update([
            'status_id' => $request->input('status'),
            'updated_at' => Carbon::now(),
        ]);

        Alert::success('You\'ve successfully edited the ticket status.')->flash();

        return redirect()->back();
    }

    /**
     * @param Request $request
     * @param $ticketId
     * @return \Illuminate\Http\RedirectResponse
     * @throws DisplayException
     */
    public function reply(Request $request, $ticketId)
    {
        $ticket = DB::table('tickets')->where('id', '=', (int) $ticketId)->first();
        if (!$ticket) {
            throw new DisplayException('Ticket not found.');
        }

        if ($ticket->status_id == 2) {
            throw new DisplayException('Ticket is closed.');
        }

        $this->validate($request, [
            'message' => 'required|string',
        ]);

        DB::table('tickets')->where('id', '=', $ticket->id)->update([
            'status_id' => 1,
            'updated_at' => Carbon::now(),
        ]);

        DB::table('ticket_messages')->insert([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::user()->id,
            'message' => trim($request->input('message')),
            'sent_at' => Carbon::now(),
        ]);

        Alert::success('You\'ve successfully sent the message.')->flash();

        return redirect()->back();
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createCategory(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:40',
        ]);

        DB::table('ticket_categories')->insert([
            'name' => trim(strip_tags($request->input('name'))),
        ]);

        Alert::success('You\'ve successfully created the new category.')->flash();

        return redirect()->route('admin.tickets');
    }

    /**
     * @param Request $request
     * @param $categoryId
     * @return \Illuminate\Http\RedirectResponse
     * @throws DisplayException
     */
    public function editCategory(Request $request, $categoryId)
    {
        $category = DB::table('ticket_categories')->where('id', '=', (int) $categoryId)->first();
        if (!$category) {
            throw new DisplayException('Category not found.');
        }

        $this->validate($request, [
            'name' => 'required|string|max:40',
        ]);

        DB::table('ticket_categories')->where('id', '=', $category->id)->update([
            'name' => trim(strip_tags($request->input('name'))),
        ]);

        Alert::success('You\'ve successfully edited the category.')->flash();

        return redirect()->route('admin.tickets');
    }

    /**
     * @param Request $request
     * @return bool[]
     * @throws DisplayException
     */
    public function deleteCategory(Request $request)
    {
        $category = DB::table('ticket_categories')->where('id', '=', (int) $request->input('id', 0))->first();
        if (!$category) {
            throw new DisplayException('Category not found.');
        }

        $categoryUsed = DB::table('tickets')->where('category_id', '=', $category->id)->get();
        if (count($categoryUsed) > 0) {
            throw new DisplayException('Category is used by tickets.');
        }

        DB::table('ticket_categories')->where('id', '=', $category->id)->delete();

        return ['success' => true];
    }
}
