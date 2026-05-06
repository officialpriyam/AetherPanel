<?php

namespace Pterodactyl\Exceptions\Solutions;

use Spatie\Ignition\Contracts\Solution;

class ManifestDoesNotExistSolution implements Solution
{
    public function getSolutionTitle(): string
    {
        return 'The frontend build has not been generated yet';
    }

    public function getSolutionDescription(): string
    {
        return 'Run `yarn frontend:build` from the repository root, or `yarn build` inside `frontend/`, to build the Next.js frontend.';
    }

    public function getDocumentationLinks(): array
    {
        return [
            'Docs' => 'https://nextjs.org/docs/app/building-your-application/deploying',
        ];
    }
}
