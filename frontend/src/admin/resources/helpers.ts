import type { ResourceSection } from '../types';
import { createPayloadForServer, DAEMON_BASE_PRESETS } from './definitions';
import { formatScalar, inputToFieldValue } from '../utils';

export function buildSummaryItems(section: ResourceSection, item: Record<string, any>): [string, string][] {
    const base: [string, string][] = [
        ['ID', String(item.id ?? '-')],
        ['Created', formatScalar(item.created_at)],
        ['Updated', formatScalar(item.updated_at)],
    ];

    if (section === 'users') {
        return [['Email', formatScalar(item.email)], ['Username', formatScalar(item.username)], ['Name', `${item.first_name || ''} ${item.last_name || ''}`.trim() || '-'], ['Admin', item.root_admin ? 'Yes' : 'No'], ...base];
    }

    if (section === 'locations') {
        return [['Short Code', formatScalar(item.short)], ['Description', formatScalar(item.long)], ...base];
    }

    if (section === 'nodes') {
        return [
            ['Name', formatScalar(item.name)],
            ['Location ID', formatScalar(item.location_id)],
            ['FQDN', formatScalar(item.fqdn)],
            ['Public', item.public ? 'Yes' : 'No'],
            ['Scheme', formatScalar(item.scheme)],
            ...base,
        ];
    }

    if (section === 'servers') {
        return [
            ['Name', formatScalar(item.name)],
            ['Identifier', formatScalar(item.identifier)],
            ['Owner ID', String(item.user)],
            ['Node ID', String(item.node)],
            ['Status', formatScalar(item.status)],
            ...base,
        ];
    }

    if (section === 'tickets') {
        const ticket = item.ticket || {};
        return [
            ['ID', String(ticket.id ?? '-')],
            ['Subject', formatScalar(ticket.subject)],
            ['Status', formatScalar(ticket.status)],
            ['Category', formatScalar(ticket.category)],
            ['Opened By', `${ticket.firstname || ''} ${ticket.lastname || ''}`.trim() || '-'],
            ['Created', formatScalar(ticket.created_at)],
            ['Updated', formatScalar(ticket.updated_at)],
        ];
    }

    if (section === 'api') {
        return [['Identifier', formatScalar(item.identifier)], ['Memo', formatScalar(item.memo)], ['User', formatScalar(item.user?.username ?? item.user_id)], ...base];
    }

    return [['Name', formatScalar(item.name || item.subject || item.identifier)], ...base];
}

export function mapEntityToFormState(section: ResourceSection, item: Record<string, any>): Record<string, any> {
    if (section === 'users') {
        return item;
    }

    if (section === 'locations') {
        return item;
    }

    if (section === 'nodes') {
        const daemonBase = String(item.daemon_base || '');
        const daemonBaseProfile = daemonBase.toLowerCase().startsWith('c:\\') ? 'windows' : 'linux';

        return {
            ...item,
            daemon_base_profile: daemonBaseProfile,
        };
    }

    if (section === 'servers') {
        return {
            ...item,
            allocation: item.allocation,
            limits_memory: item.limits?.memory,
            limits_swap: item.limits?.swap,
            limits_disk: item.limits?.disk,
            limits_io: item.limits?.io,
            limits_cpu: item.limits?.cpu,
            limits_threads: item.limits?.threads,
            feature_limits_databases: item.feature_limits?.databases,
            feature_limits_allocations: item.feature_limits?.allocations,
            feature_limits_backups: item.feature_limits?.backups,
            image: item.container?.image,
            environment_json: JSON.stringify(item.container?.environment || {}, null, 2),
        };
    }

    return item;
}

export function buildCreatePayload(section: ResourceSection, state: Record<string, string>) {
    if (section === 'servers') {
        return createPayloadForServer(state);
    }

    if (section === 'api') {
        return Object.entries(state).reduce<Record<string, any>>((payload, [key, value]) => {
            payload[key] = key === 'memo' ? value : Number(value || 0);
            return payload;
        }, {});
    }

    if (section === 'nodes') {
        const profile = (state.daemon_base_profile === 'windows' ? 'windows' : 'linux') as keyof typeof DAEMON_BASE_PRESETS;
        const daemonBase = (state.daemon_base || '').trim() || DAEMON_BASE_PRESETS[profile];

        return {
            name: state.name,
            description: state.description || null,
            location_id: Number(state.location_id || 0),
            fqdn: state.fqdn,
            scheme: state.scheme || 'https',
            public: state.public === 'true',
            behind_proxy: state.behind_proxy === 'true',
            maintenance_mode: state.maintenance_mode === 'true',
            memory: Number(state.memory || 0),
            memory_overallocate: Number(state.memory_overallocate || 0),
            disk: Number(state.disk || 0),
            disk_overallocate: Number(state.disk_overallocate || 0),
            upload_size: Number(state.upload_size || 0),
            daemon_listen: Number(state.daemon_listen || 8080),
            daemon_sftp: Number(state.daemon_sftp || 2022),
            daemon_base: daemonBase,
        };
    }

    const payload: Record<string, any> = {};
    Object.entries(state).forEach(([key, value]) => {
        payload[key] = value === '' ? null : inputToFieldValue({ key, label: key, type: 'text' }, value);
    });

    payload.root_admin = state.root_admin === 'true';
    payload.public = state.public === 'true';
    payload.behind_proxy = state.behind_proxy === 'true';
    payload.maintenance_mode = state.maintenance_mode === 'true';
    payload.read_only = state.read_only === 'true';
    payload.user_mountable = state.user_mountable === 'true';

    return payload;
}

export function buildUpdatePayload(section: ResourceSection, _tab: string, state: Record<string, string>) {
    if (section === 'servers') {
        return {
            name: state.name,
            description: state.description || null,
            user: Number(state.user),
            external_id: state.external_id || null,
        };
    }

    return buildCreatePayload(section, state);
}
