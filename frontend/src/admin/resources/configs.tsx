import Link from 'next/link';
import React from 'react';
import { LuArrowUpRight, LuPlus } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import { DetailList, Glyph, SimpleTable, StatusBadge } from '../components/common';
import type { ResourceConfig, ResourceSection } from '../types';
import { formatScalar, getRelationItems, toTitleCase } from '../utils';
import {
    apiKeyFields,
    loadLocationsRef,
    loadMountRefs,
    loadServerRefs,
    loadTicketRefs,
    locationFields,
    mountFields,
    nestFields,
    nodeDetailTabs,
    nodeFields,
    serverCreateFields,
    serverDetailTabs,
    serverDetailsFields,
    userFields,
} from './definitions';
import MountAttachmentPanels from '../sections/MountAttachmentPanels';
import NodeDetailPanels from '../sections/NodeDetailPanels';
import ServerDetailPanels from '../sections/ServerDetailPanels';
import TicketActionPanels from '../sections/TicketActionPanels';
import TicketCategoryPanel from '../sections/TicketCategoryPanel';

export const resourceConfigs: Record<ResourceSection, ResourceConfig> = {
    users: {
        section: 'users',
        title: 'Users',
        listEndpoint: '/api/application/users',
        detailEndpoint: (id) => `/api/application/users/${id}`,
        emptyMessage: 'No users found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Email', render: (item) => item.email },
            { label: 'Client Name', render: (item) => `${item.first_name} ${item.last_name}`.trim() },
            { label: 'Username', render: (item) => item.username },
            { label: '2FA', render: (item) => <StatusBadge tone={item['2fa'] ? 'success' : 'danger'}>{item['2fa'] ? 'Enabled' : 'Disabled'}</StatusBadge> },
            { label: 'Role', render: (item) => <StatusBadge tone={item.root_admin ? 'warning' : 'neutral'}>{item.root_admin ? 'Admin' : 'Client'}</StatusBadge> },
        ],
        searchKeys: ['email', 'username', 'first_name', 'last_name'],
        createFields: userFields,
        createEndpoint: '/api/application/users',
        createTitle: 'Create User',
        updateFields: userFields,
        updateEndpoint: (id) => `/api/application/users/${id}`,
        deleteEndpoint: (id) => `/api/application/users/${id}`,
        deleteLabel: 'Delete User',
    },
    locations: {
        section: 'locations',
        title: 'Locations',
        listEndpoint: '/api/application/locations',
        detailEndpoint: (id) => `/api/application/locations/${id}`,
        emptyMessage: 'No locations found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Short Code', render: (item) => item.short },
            { label: 'Description', render: (item) => item.long },
            { label: 'Nodes', render: (item) => item.nodes_count ?? getRelationItems(item, 'nodes').length },
            { label: 'Servers', render: (item) => item.servers_count ?? getRelationItems(item, 'servers').length },
        ],
        searchKeys: ['short', 'long'],
        createFields: locationFields,
        createEndpoint: '/api/application/locations',
        createTitle: 'Create Location',
        updateFields: locationFields,
        updateEndpoint: (id) => `/api/application/locations/${id}`,
        deleteEndpoint: (id) => `/api/application/locations/${id}`,
        deleteLabel: 'Delete Location',
        loadRefs: loadLocationsRef,
        renderDetailExtras: (item) => (
            <DetailList
                title="Attached Infrastructure"
                items={[
                    ['Nodes', String(item.nodes_count ?? getRelationItems(item, 'nodes').length)],
                    ['Servers', String(item.servers_count ?? getRelationItems(item, 'servers').length)],
                    ['Created', formatScalar(item.created_at)],
                    ['Updated', formatScalar(item.updated_at)],
                ]}
            />
        ),
    },
    nodes: {
        section: 'nodes',
        title: 'Nodes',
        listEndpoint: '/api/application/nodes',
        listInclude: 'location',
        detailEndpoint: (id) => `/api/application/nodes/${id}`,
        detailInclude: 'location,servers,allocations',
        emptyMessage: 'No nodes found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Name', render: (item) => item.name },
            { label: 'Location', render: (item) => {
                const location = getRelationItems(item, 'location')[0];
                const locationLabel = location?.short || location?.long || (location?.id ? `#${location.id}` : null);

                if (locationLabel) {
                    return location?.id && location?.short ? `${location.short} (#${location.id})` : locationLabel;
                }

                return item.location_id ? `#${item.location_id}` : '-';
            } },
            { label: 'Memory', render: (item) => `${item.memory} MiB` },
            { label: 'Disk', render: (item) => `${item.disk} MiB` },
            { label: 'Servers', render: (item) => item.servers_count ?? getRelationItems(item, 'servers').length },
            { label: 'Public', render: (item) => <StatusBadge tone={item.public ? 'success' : 'neutral'}>{item.public ? 'Yes' : 'No'}</StatusBadge> },
        ],
        searchKeys: ['name', 'fqdn', 'description'],
        createFields: nodeFields,
        createEndpoint: '/api/application/nodes',
        createTitle: 'Create Node',
        updateFields: nodeFields,
        updateEndpoint: (id) => `/api/application/nodes/${id}`,
        deleteEndpoint: (id) => `/api/application/nodes/${id}`,
        deleteLabel: 'Delete Node',
        loadRefs: loadLocationsRef,
        detailTabs: nodeDetailTabs,
        editTabId: 'settings',
        renderDetailExtras: (item, refs, refresh, route) => (
            <NodeDetailPanels item={item} refs={refs} refresh={refresh} route={route} />
        ),
    },
    servers: {
        section: 'servers',
        title: 'Servers',
        listEndpoint: '/api/application/servers',
        listInclude: 'user,node',
        detailEndpoint: (id) => `/api/application/servers/${id}`,
        detailInclude: 'user,node,allocations,databases,egg,nest,location,variables',
        emptyMessage: 'No servers found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Server', render: (item) => item.name },
            { label: 'Identifier', render: (item) => <code>{item.identifier}</code> },
            { label: 'Owner', render: (item) => {
                const user = getRelationItems(item, 'user')[0];
                if (user) {
                    return `${user.username} (#${user.id})`;
                }

                return item.user ? `#${item.user}` : '-';
            } },
            { label: 'Node', render: (item) => {
                const node = getRelationItems(item, 'node')[0];
                if (node) {
                    return `${node.name} (#${node.id})`;
                }

                return item.node ? `#${item.node}` : '-';
            } },
            { label: 'Status', render: (item) => <StatusBadge tone={item.status ? 'success' : 'neutral'}>{item.status || (item.suspended ? 'Suspended' : 'Unknown')}</StatusBadge> },
        ],
        searchKeys: ['name', 'identifier', 'description'],
        createFields: serverCreateFields,
        createEndpoint: '/api/application/servers',
        createTitle: 'Create Server',
        updateFields: serverDetailsFields,
        updateEndpoint: (id) => `/api/application/servers/${id}/details`,
        deleteEndpoint: (id) => `/api/application/servers/${id}`,
        deleteLabel: 'Delete Server',
        detailTabs: serverDetailTabs,
        editTabId: 'details',
        loadRefs: loadServerRefs,
        renderDetailExtras: (item, refs, refresh, route) => (
            <ServerDetailPanels server={item} refs={refs} refresh={refresh} route={route} />
        ),
    },
    nests: {
        section: 'nests',
        title: 'Nests',
        listEndpoint: '/api/admin/nests',
        detailEndpoint: (id) => `/api/admin/nests/${id}`,
        emptyMessage: 'No nests found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Name', render: (item) => item.name },
            { label: 'Author', render: (item) => item.author || '-' },
            { label: 'Eggs', render: (item) => item.eggs_count ?? getRelationItems(item, 'eggs').length },
            { label: 'Servers', render: (item) => item.servers_count ?? getRelationItems(item, 'servers').length },
        ],
        searchKeys: ['name', 'description', 'author'],
        createFields: nestFields,
        createEndpoint: '/api/admin/nests',
        createTitle: 'Create Nest',
        updateFields: nestFields,
        updateEndpoint: (id) => `/api/admin/nests/${id}`,
        deleteEndpoint: (id) => `/api/admin/nests/${id}`,
        deleteLabel: 'Delete Nest',
        renderDetailExtras: (item) => (
            <>
                <DetailList
                    title="Nest Summary"
                    items={[
                        ['Author', formatScalar(item.author)],
                        ['Description', formatScalar(item.description)],
                        ['Egg Count', String(item.eggs_count ?? getRelationItems(item, 'eggs').length)],
                        ['Server Count', String(item.servers_count ?? getRelationItems(item, 'servers').length)],
                    ]}
                />
                <SimpleTable
                    title="Eggs"
                    columns={['Name', 'Docker Images', 'Startup', 'Open']}
                    rows={(item.eggs || getRelationItems(item, 'eggs')).map((egg: Record<string, any>) => [
                        egg.name,
                        egg.docker_images ? Object.keys(egg.docker_images).join(', ') : '-',
                        egg.startup || '-',
                        <Link key={egg.id} href={`/admin/nests/egg/${egg.id}`} className="admin-inline-link">Open <Glyph icon={LuArrowUpRight} /></Link>,
                    ])}
                    emptyLabel="No eggs are linked to this nest."
                />
                <div className="admin-actions-row">
                    <Link href="/admin/nests/egg/new" className="admin-button admin-button--primary"><Glyph icon={LuPlus} />Create Egg</Link>
                </div>
            </>
        ),
    },
    mounts: {
        section: 'mounts',
        title: 'Mounts',
        listEndpoint: '/api/admin/mounts',
        detailEndpoint: (id) => `/api/admin/mounts/${id}`,
        emptyMessage: 'No mounts found.',
        columns: [
            { label: 'Name', render: (item) => item.name },
            { label: 'Source', render: (item) => item.source },
            { label: 'Target', render: (item) => item.target },
            { label: 'Read Only', render: (item) => <StatusBadge tone={item.read_only ? 'warning' : 'neutral'}>{item.read_only ? 'Yes' : 'No'}</StatusBadge> },
        ],
        searchKeys: ['name', 'source', 'target'],
        createFields: mountFields,
        createEndpoint: '/api/admin/mounts',
        createTitle: 'Create Mount',
        updateFields: mountFields,
        updateEndpoint: (id) => `/api/admin/mounts/${id}`,
        deleteEndpoint: (id) => `/api/admin/mounts/${id}`,
        deleteLabel: 'Delete Mount',
        loadRefs: loadMountRefs,
        renderDetailExtras: (item, refs, refresh) => (
            <>
                <DetailList
                    title="Mount Details"
                    items={[
                        ['Description', formatScalar(item.description)],
                        ['Source', formatScalar(item.source)],
                        ['Target', formatScalar(item.target)],
                        ['Read Only', item.read_only ? 'Yes' : 'No'],
                    ]}
                />
                <SimpleTable
                    title="Eggs"
                    columns={['ID', 'Name', 'Actions']}
                    rows={(item.eggs || []).map((egg: Record<string, any>) => [
                        egg.id,
                        egg.name,
                        <button key={`detach-egg-${egg.id}`} type="button" className="admin-button admin-button--danger" onClick={async () => {
                            if (!window.confirm('Detach this egg from the mount?')) {
                                return;
                            }
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.delete(`/api/admin/mounts/${item.id}/eggs/${egg.id}`);
                                await refresh();
                            } catch (actionError) {
                                window.alert(toHuman(actionError));
                            }
                        }}>Detach</button>,
                    ])}
                    emptyLabel="No eggs are attached to this mount."
                />
                <SimpleTable
                    title="Nodes"
                    columns={['ID', 'Name', 'Actions']}
                    rows={(item.nodes || []).map((node: Record<string, any>) => [
                        node.id,
                        node.name,
                        <button key={`detach-node-${node.id}`} type="button" className="admin-button admin-button--danger" onClick={async () => {
                            if (!window.confirm('Detach this node from the mount?')) {
                                return;
                            }
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.delete(`/api/admin/mounts/${item.id}/nodes/${node.id}`);
                                await refresh();
                            } catch (actionError) {
                                window.alert(toHuman(actionError));
                            }
                        }}>Detach</button>,
                    ])}
                    emptyLabel="No nodes are attached to this mount."
                />
                <MountAttachmentPanels item={item} refs={refs} refresh={refresh} />
            </>
        ),
    },
    tickets: {
        section: 'tickets',
        title: 'Tickets',
        listEndpoint: '/api/admin/tickets',
        detailEndpoint: (id) => `/api/admin/tickets/${id}`,
        emptyMessage: 'No tickets found.',
        columns: [
            { label: 'ID', render: (item) => <code>{item.id}</code> },
            { label: 'Subject', render: (item) => item.subject },
            { label: 'Category', render: (item) => item.category || '-' },
            { label: 'User', render: (item) => `${item.firstname || ''} ${item.lastname || ''}`.trim() || '-' },
            { label: 'Status', render: (item) => <StatusBadge tone={String(item.status).toLowerCase() === 'closed' ? 'neutral' : 'success'}>{item.status || 'Open'}</StatusBadge> },
        ],
        searchKeys: ['subject', 'category', 'firstname', 'lastname', 'serverName'],
        loadRefs: loadTicketRefs,
        renderListExtras: () => <TicketCategoryPanel />,
        renderDetailExtras: (item, refs, refresh) => (
            <>
                <DetailList
                    title="Ticket Meta"
                    items={[
                        ['Category', formatScalar(item.ticket?.category)],
                        ['Related Server', formatScalar(item.ticket?.serverName)],
                        ['Opened By', `${item.ticket?.firstname || ''} ${item.ticket?.lastname || ''}`.trim() || '-'],
                        ['Status', formatScalar(item.ticket?.status)],
                    ]}
                />
                <SimpleTable
                    title="Messages"
                    columns={['Author', 'Message', 'Sent']}
                    rows={(item.messages || []).map((message: Record<string, any>) => [
                        `${message.firstname || ''} ${message.lastname || ''}`.trim() || 'System',
                        message.message,
                        message.sent_at,
                    ])}
                    emptyLabel="No ticket messages found."
                />
                <TicketActionPanels item={item} refs={refs} refresh={refresh} />
            </>
        ),
    },
    databases: {
        section: 'databases',
        title: 'Database Hosts',
        listEndpoint: '/api/admin/database-hosts',
        detailEndpoint: (id) => `/api/admin/database-hosts/${id}`,
        emptyMessage: 'No database hosts found.',
        columns: [
            { label: 'Name', render: (item) => item.name },
            { label: 'Host', render: (item) => item.host },
            { label: 'Port', render: (item) => item.port },
            { label: 'Username', render: (item) => item.username },
        ],
        searchKeys: ['name', 'host', 'username'],
        renderDetailExtras: (item) => (
            <>
                <DetailList
                    title="Host Details"
                    items={[
                        ['Node', formatScalar(item.node?.name)],
                        ['Host', formatScalar(item.host)],
                        ['Port', formatScalar(item.port)],
                        ['Username', formatScalar(item.username)],
                    ]}
                />
                <SimpleTable
                    title="Databases"
                    columns={['Database', 'Username', 'Remote']}
                    rows={(item.databases || []).map((database: Record<string, any>) => [database.database, database.username, database.remote])}
                    emptyLabel="No server databases are attached to this host."
                />
            </>
        ),
    },
    api: {
        section: 'api',
        title: 'Application API',
        listEndpoint: '/api/admin/application-api',
        detailEndpoint: (id) => `/api/admin/application-api/${id}`,
        emptyMessage: 'No application API keys found.',
        columns: [
            { label: 'Identifier', render: (item) => <code>{item.identifier}</code> },
            { label: 'Memo', render: (item) => item.memo || '-' },
            { label: 'User', render: (item) => item.user_id || '-' },
            { label: 'Created', render: (item) => item.created_at || '-' },
        ],
        searchKeys: ['identifier', 'memo', 'user_id'],
        createFields: apiKeyFields,
        createEndpoint: '/api/admin/application-api',
        createTitle: 'Create Application API Key',
        deleteEndpoint: (id) => `/api/admin/application-api/${id}`,
        deleteLabel: 'Revoke API Key',
        renderDetailExtras: (item) => (
            <>
                <DetailList
                    title="Key Details"
                    items={[
                        ['Identifier', formatScalar(item.identifier)],
                        ['Memo', formatScalar(item.memo)],
                        ['User', formatScalar(item.user?.username ?? item.user_id)],
                        ['Last Used', formatScalar(item.last_used_at)],
                    ]}
                />
                <SimpleTable
                    title="Permissions"
                    columns={['Resource', 'Level']}
                    rows={Object.entries(item.permissions || {}).map(([resource, permission]) => [
                        toTitleCase(resource),
                        Number(permission) === 3 ? 'Read + Write' : Number(permission) === 1 ? 'Read Only' : 'No Access',
                    ])}
                    emptyLabel="No permission metadata was returned for this key."
                />
            </>
        ),
    },
};

export const resourceSections = new Set<ResourceSection>(Object.keys(resourceConfigs) as ResourceSection[]);
