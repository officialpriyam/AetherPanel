'use client';

import React from 'react';
import { SimpleTable } from '../components/common';

export default function NodeReferenceHelp({ refs }: { refs: Record<string, any> }) {
    return (
        <SimpleTable
            title="Location References"
            columns={['Location ID', 'Short Code', 'Description', 'Nodes', 'Servers']}
            rows={(refs.locations || []).map((location: Record<string, any>) => [
                location.id,
                location.short,
                location.long || '-',
                location.nodes_count ?? '-',
                location.servers_count ?? '-',
            ])}
            emptyLabel="No location references are available yet."
        />
    );
}
