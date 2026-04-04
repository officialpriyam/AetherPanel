@extends('layouts.admin')

@section('title')
    Tickets
@endsection

@section('content-header')
    <h1>Tickets <small>Read / reply to tickets.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Tickets</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12 col-lg-8">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Tickets</h3>
                    <div class="box-tools search01">
                        <form action="{{ route('admin.tickets') }}" method="GET">
                            <div class="input-group input-group-sm">
                                <select class="form-control" name="status">
                                    <option value="">- All -</option>
                                    @foreach ($statuses as $key => $status)
                                        <option value="{{ $key + 1 }}" {{ request()->input('status', '') == $key + 1 ? 'selected' : '' }}>{{ $status['name'] }}</option>
                                    @endforeach
                                </select>
                                <div class="input-group-btn">
                                    <button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Subject</th>
                                <th>Client</th>
                                <th>Status</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Related Server</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($tickets as $ticket)
                                <tr>
                                    <td>{{ $ticket->id }}</td>
                                    <td><span class="label label-primary">{{ $ticket->subject }}</span></td>
                                    <td><a href="{{ route('admin.users.new', $ticket->user_id) }}" target="_blank">{{ $ticket->firstname }} {{ $ticket->lastname }}</a></td>
                                    <td><span class="label label-{{ $statuses[$ticket->status_id]['color'] }}">{{ $statuses[$ticket->status_id]['name'] }}</span></td>
                                    <td><code>{{ $ticket->category }}</code></td>
                                    <td><span class="label label-{{ $priorities[$ticket->priority_id]['color'] }}">{{ $priorities[$ticket->priority_id]['name'] }}</span></td>
                                    <td>{!! is_null($ticket->related_server_id) ? '<span class="label label-warning">No server linked</span>' : '<a href="' . route('admin.servers.view', $ticket->related_server_id) . '" target="_blank">' . $ticket->serverName . '</a>' !!}</td>
                                    <td><code>{{ $ticket->created_at }}</code></td>
                                    <td><code>{{ $ticket->updated_at }}</code></td>
                                    <td>
                                        <a class="btn btn-primary btn-xs" href="{{ route('admin.tickets.view', $ticket->id) }}"><i class="fa fa-eye"></i></a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <th colspan="10">There are no tickets.</th>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if($tickets->hasPages())
                    <div class="box-footer with-border">
                        <div class="col-md-12 text-center">{!! $tickets->appends(['filter' => request()->input('status')])->render() !!}</div>
                    </div>
                @endif
            </div>
        </div>
        <div class="col-xs-12 col-lg-4">
            @if ($createCategory || $editCategory)
                <div class="box box-{{ $createCategory ? 'success' : 'warning' }}">
                    <div class="box-header with-border">
                        <h3 class="box-title">{{ $createCategory ? 'Create Category' : 'Edit Category' }}</h3>
                    </div>
                    <form method="post" action="{{ $createCategory ? route('admin.tickets.categories.create') : route('admin.tickets.categories.edit', $editCategory->id) }}">
                        <div class="box-body">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" name="name" class="form-control" placeholder="Category name..." value="{{ old('name', @$editCategory->name) }}" autofocus>
                            </div>
                        </div>
                        <div class="box-footer">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-success pull-right">Save</button>
                            <a class="btn btn-default" href="{{ route('admin.tickets') }}">Go Back</a>
                        </div>
                    </form>
                </div>
            @else
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">Categories</h3>
                        <div class="box-tools">
                            <a class="btn btn-success btn-sm" href="{{ route('admin.tickets.categories.create') }}">Create</a>
                        </div>
                    </div>
                    <div class="box-body table-responsive no-padding">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($categories as $category)
                                    <tr>
                                        <td>{{ $category->id }}</td>
                                        <td>{{ $category->name }}</td>
                                        <td>
                                            <a class="btn btn-primary btn-xs" href="{{ route('admin.tickets.categories.view', $category->id) }}"><i class="fa fa-pencil"></i></a>
                                            <button class="btn btn-danger btn-xs" data-action="delete-category" data-id="{{ $category->id }}"><i class="fa fa-trash"></i></button>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <th colspan="3">There are no category added.</th>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent

    <script>
        $('[data-action="delete-category"]').click(function (event) {
            event.preventDefault();
            let self = $(this);
            swal({
                title: '',
                type: 'warning',
                text: 'Are you sure you want to delete this category?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                closeOnConfirm: false,
                showLoaderOnConfirm: true,
                cancelButtonText: 'Cancel',
            }, function () {
                $.ajax({
                    method: 'DELETE',
                    url: '{{ route('admin.tickets.categories.delete') }}',
                    headers: {'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')},
                    data: {
                        id: self.data('id'),
                    }
                }).done(() => {
                    self.parent().parent().slideUp();

                    swal({
                        type: 'success',
                        title: 'Success!',
                        text: 'You have successfully deleted this category.'
                    });
                }).fail((jqXHR) => {
                    swal({
                        type: 'error',
                        title: 'Ooops!',
                        text: (typeof jqXHR.responseJSON.error !== 'undefined') ? jqXHR.responseJSON.error : 'A system error has occurred! Please try again later...'
                    });
                });
            });
        });
    </script>
@endsection
