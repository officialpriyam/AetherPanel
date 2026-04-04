@extends('layouts.admin')

@section('title')
    View Ticket
@endsection

@section('content-header')
    <h1>Ticket - #{{ $ticket->id }} <small>Read / reply to opened ticket.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.tickets') }}">Tickets</a></li>
        <li class="active">Ticket - #{{ $ticket->id }}</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        @if ($ticket->status_id == 2)
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    This ticket is closed. Please re-open if you want to send message.
                </div>
            </div>
        @endif
        <div class="col-xs-12 col-lg-8">
            @if ($ticket->status_id != 2)
                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title">Reply</h3>
                    </div>
                    <form method="post" action="{{ route('admin.tickets.view.reply', $ticket->id) }}">
                        <div class="box-body">
                            <div class="form-group">
                                <label for="message">Message</label>
                                <textarea id="message" name="message" class="form-control">{{ old('message') }}</textarea>
                            </div>
                        </div>
                        <div class="box-footer">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-success pull-right">Send</button>
                        </div>
                    </form>
                </div>
            @endif
            @foreach ($messages as $message)
                <div class="box box-{{ $message->user_id == $ticket->user_id ? 'primary' : 'danger' }}">
                    <div class="box-header with-border">
                        <h3 class="box-title">{{ $message->firstname }} {{ $message->lastname }} ({{ $message->user_id == $ticket->user_id ? 'Client' : 'Admin' }})</h3>
                        <div class="box-tools" style="padding-top: .4rem;">
                            {{ $message->sent_at }}
                        </div>
                    </div>
                    <div class="box-body">
                        {!! $message->message !!}
                    </div>
                </div>
            @endforeach
        </div>
        <div class="col-xs-12 col-lg-4">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Information</h3>
                </div>
                <div class="box-body">
                    <dl class="dl-horizontal">
                        <dt style="padding-top: .35rem;">Subject:</dt>
                        <dd style="padding-top: .35rem;"><span class="label label-primary">{{ $ticket->subject }}</span></dd>

                        <dt style="padding-top: .35rem;">Client:</dt>
                        <dd style="padding-top: .35rem;"><a href="{{ route('admin.users.new', $ticket->user_id) }}" target="_blank">{{ $ticket->firstname }} {{ $ticket->lastname }}</a></dd>

                        <dt style="padding-top: .35rem;">Status:</dt>
                        <dd style="padding-top: .35rem;"><span class="label label-{{ $statuses[$ticket->status_id]['color'] }}">{{ $statuses[$ticket->status_id]['name'] }}</span></dd>

                        <dt style="padding-top: .35rem;">Category:</dt>
                        <dd style="padding-top: .35rem;"><code>{{ $ticket->category }}</code></dd>

                        <dt style="padding-top: .35rem;">Priority:</dt>
                        <dd style="padding-top: .35rem;"><span class="label label-{{ $priorities[$ticket->priority_id]['color'] }}">{{ $priorities[$ticket->priority_id]['name'] }}</span></dd>

                        <dt style="padding-top: .35rem;">Related Server:</dt>
                        <dd style="padding-top: .35rem;">{!! is_null($ticket->related_server_id) ? '<span class="label label-warning">No server linked</span>' : '<a href="' . route('admin.servers.view', $ticket->related_server_id) . '" target="_blank">' . $ticket->serverName . '</a>' !!}</dd>

                        <dt style="padding-top: .35rem;">Created At:</dt>
                        <dd style="padding-top: .35rem;"><code>{{ $ticket->created_at }}</code></dd>

                        <dt style="padding-top: .35rem;">Updated At:</dt>
                        <dd style="padding-top: .35rem;"><code>{{ $ticket->updated_at }}</code></dd>
                    </dl>
                </div>
            </div>
            <div class="box box-warning">
                <div class="box-header with-border">
                    <h3 class="box-title">Box Title</h3>
                </div>
                <form method="post" action="{{ route('admin.tickets.view.status', $ticket->id) }}">
                    <div class="box-body">
                        <p>If you set as <b>Closed</b>, you can't send message until the ticket will be re-opened.</p>
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" class="form-control">
                                @foreach ($statuses as $key => $status)
                                    <option value="{{ $key }}" {{ $ticket->status_id == $key ? 'selected' : '' }}>{{ $status['name'] }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-success pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script src="//cdn.ckeditor.com/ckeditor5/12.4.0/classic/ckeditor.js"></script>

    <script>
        function MinHeightPlugin(editor) {
            this.editor = editor;
        }

        MinHeightPlugin.prototype.init = function () {
            this.editor.ui.view.editable.extendTemplate({
                attributes: {
                    style: {
                        minHeight: '100px',
                    },
                },
            });
        };

        ClassicEditor.builtinPlugins.push(MinHeightPlugin);
        ClassicEditor
            .create(document.querySelector('#message'))
            .catch(error => {
                console.error(error);
            });
    </script>
@endsection
