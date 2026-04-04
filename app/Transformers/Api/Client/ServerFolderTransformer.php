<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\ServerFolder;

class ServerFolderTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return 'server_folder';
    }

    /**
     * Transform the folder model into a JSONAPI array.
     */
    public function transform(ServerFolder $folder): array
    {
        return [
            'id' => $folder->id,
            'name' => $folder->name,
            'description' => $folder->description,
            'user_id' => $folder->user_id,
        ];
    }
}
