<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerFolder;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Transformers\Api\Client\ServerFolderTransformer;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Illuminate\Http\Request;

class ServerFolderController extends ClientApiController
{
    /**
     * Return all of the folders for the authenticated user.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->fractal->collection($request->user()->folders)
            ->transformWith($this->getTransformer(ServerFolderTransformer::class))
            ->toArray();
    }

    /**
     * Create a new folder for the authenticated user.
     */
    public function store(Request $request): array
    {
        $request->validate([
            'name' => 'required|string|max:191',
        ]);

        $folder = ServerFolder::create([
            'name' => $request->input('name'),
            'user_id' => $request->user()->id,
        ]);

        return $this->fractal->item($folder)
            ->transformWith($this->getTransformer(ServerFolderTransformer::class))
            ->toArray();
    }

    /**
     * Update an existing folder.
     */
    public function update(Request $request, ServerFolder $folder): array
    {
        if ($folder->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:191',
        ]);

        $folder->update([
            'name' => $request->input('name'),
        ]);

        return $this->fractal->item($folder)
            ->transformWith($this->getTransformer(ServerFolderTransformer::class))
            ->toArray();
    }

    /**
     * Delete a folder.
     */
    public function delete(Request $request, ServerFolder $folder): JsonResponse
    {
        if ($folder->user_id !== $request->user()->id) {
            abort(403);
        }

        // Dissociate servers from this folder
        Server::where('folder_id', $folder->id)->update(['folder_id' => null]);

        $folder->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    /**
     * Move a server into a folder.
     */
    public function move(Request $request, Server $server): JsonResponse
    {
        // Ensure the user owns the server or has access (simplified for now to owner)
        if ($server->owner_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'folder_id' => 'nullable|integer|exists:server_folders,id',
        ]);

        $folderId = $request->input('folder_id');
        if ($folderId) {
            $folder = ServerFolder::findOrFail($folderId);
            if ($folder->user_id !== $request->user()->id) {
                abort(403);
            }
        }

        $server->update([
            'folder_id' => $folderId,
        ]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}
