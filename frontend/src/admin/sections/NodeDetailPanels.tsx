'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { LuArrowUpRight, LuCopy, LuPlus, LuShield } from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { adminHttp, toHuman } from '../api';
import type { AdminRoute } from '../types';
import { Banner, DetailList, Glyph, Panel, SimpleTable, StatusBadge } from '../components/common';
import { formatScalar, getRelationItems, normalizeApiPayload } from '../utils';
import { normalizeDaemonBasePathValue } from '../resources';

const sanitizeConfiguration = (value: string): string =>
    value
        .replaceAll('C:\\ourpanel\\volumes', 'C:\\aetherpanel\\volumes')
        .replaceAll('C:\\pterodactyl\\volumes', 'C:\\aetherpanel\\volumes')
        .replaceAll('/var/lib/ourpanel/volumes', '/var/lib/aetherpanel/volumes')
        .replaceAll('/var/lib/pterodactyl/volumes', '/var/lib/aetherpanel/volumes');

const buildLinuxInstallCommand = (configuration: string): string => [
    'sudo install -d -m 755 /etc/pterodactyl',
    "sudo tee /etc/pterodactyl/config.yml > /dev/null <<'EOF'",
    configuration,
    'EOF',
    'sudo systemctl restart wings',
].join('\n');

const buildWindowsInstallCommand = (configuration: string): string => [
    "New-Item -ItemType Directory -Force 'C:\\ProgramData\\Pterodactyl' | Out-Null",
    "@'",
    configuration,
    "'@ | Set-Content -Path 'C:\\ProgramData\\Pterodactyl\\config.yml' -Encoding UTF8",
    'Restart-Service wings',
].join('\n');

export default function NodeDetailPanels({ item, refs, refresh, route }: { item: Record<string, any>; refs: Record<string, any>; refresh: () => Promise<void>; route: AdminRoute }) {
    const [configuration, setConfiguration] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
    const [liveAllocations, setLiveAllocations] = useState<Record<string, any>[]>([]);
    const [allocationsLoaded, setAllocationsLoaded] = useState(false);
    const [nodeStatus, setNodeStatus] = useState<Record<string, any> | null>(null);
    const [allocationState, setAllocationState] = useState({ ip: '', alias: '', ports: '' });

    const loadAllocations = useCallback(async () => {
        setAllocationsLoaded(false);

        try {
            const { data } = await adminHttp.get(`/api/application/nodes/${item.id}/allocations`, {
                params: { per_page: 200 },
            });

            setLiveAllocations(Array.isArray(normalizeApiPayload(data)) ? normalizeApiPayload(data) : []);
        } catch {
            setLiveAllocations(getRelationItems(item, 'allocations'));
        } finally {
            setAllocationsLoaded(true);
        }
    }, [item, item.id]);

    const loadNodeStatus = useCallback(async () => {
        try {
            const { data } = await adminHttp.get(`/api/admin/nodes/${item.id}/status`);
            setNodeStatus(data?.data ?? null);
        } catch {
            setNodeStatus({
                online: false,
                status: 'offline',
                version: null,
            });
        }
    }, [item.id]);

    const allocations = allocationsLoaded ? liveAllocations : getRelationItems(item, 'allocations');
    const servers = getRelationItems(item, 'servers');
    const defaultAllocationIp = allocations[0]?.ip || item.fqdn || '';

    useEffect(() => {
        setAllocationState({ ip: defaultAllocationIp, alias: '', ports: '' });
    }, [item.id, defaultAllocationIp]);

    useEffect(() => {
        loadAllocations();
        loadNodeStatus();
    }, [loadAllocations, loadNodeStatus]);

    useEffect(() => {
        if (route.tab !== 'configuration') {
            return;
        }

        let active = true;
        setConfiguration('');
        setError(null);

        adminHttp.get(`/api/application/nodes/${item.id}/configuration`, {
            params: { format: 'yaml' },
            responseType: 'text',
            transformResponse: [(data) => data],
        })
            .then(({ data }) => {
                if (!active) {
                    return;
                }

                setConfiguration(typeof data === 'string' ? sanitizeConfiguration(data) : '');
            })
            .catch((loadError) => {
                if (active) {
                    setError(toHuman(loadError));
                }
            });

        return () => {
            active = false;
        };
    }, [item.id, route.tab]);

    const location = getRelationItems(item, 'location')[0];
    const locationLabel = location?.short || location?.long || location?.id || item.location_id;
    const daemonBase = normalizeDaemonBasePathValue(item.daemon_base);
    const prefersWindowsCommand = daemonBase.toLowerCase().startsWith('c:\\');
    const installCommand = prefersWindowsCommand ? buildWindowsInstallCommand(configuration) : buildLinuxInstallCommand(configuration);
    const installCommandLabel = prefersWindowsCommand ? 'PowerShell Install Command' : 'Linux Install Command';
    const nodeStatusLabel = nodeStatus?.online ? 'Online' : nodeStatus ? 'Offline' : 'Checking';
    const nodeStatusTone = nodeStatus?.online ? 'success' : nodeStatus ? 'danger' : 'neutral';
    const connectivityPanel = (
        <Panel
            title="Node Connectivity"
            copy="The panel checks Wings reachability directly and caches the result briefly to avoid hammering the node."
            actions={(
                <button
                    type="button"
                    className="admin-button"
                    disabled={busy === 'node-status'}
                    onClick={async () => {
                        setBusy('node-status');
                        try {
                            await loadNodeStatus();
                        } finally {
                            setBusy(null);
                        }
                    }}
                >
                    {busy === 'node-status' ? 'Refreshing...' : 'Refresh Status'}
                </button>
            )}
        >
            <div className="admin-detail-grid">
                <div className="admin-detail-grid__item">
                    <span>Connectivity</span>
                    <strong><StatusBadge tone={nodeStatusTone}>{nodeStatusLabel}</StatusBadge></strong>
                </div>
                <div className="admin-detail-grid__item">
                    <span>Wings Version</span>
                    <strong>{formatScalar(nodeStatus?.version)}</strong>
                </div>
                <div className="admin-detail-grid__item">
                    <span>Operating System</span>
                    <strong>{formatScalar(nodeStatus?.system?.type)}</strong>
                </div>
                <div className="admin-detail-grid__item">
                    <span>Architecture</span>
                    <strong>{formatScalar(nodeStatus?.system?.arch)}</strong>
                </div>
            </div>
        </Panel>
    );

    useEffect(() => {
        if (!copiedTarget) {
            return;
        }

        const timeout = window.setTimeout(() => setCopiedTarget(null), 2500);

        return () => window.clearTimeout(timeout);
    }, [copiedTarget]);

    const copyText = (target: 'yaml' | 'command', value: string) => {
        if (!value) {
            return;
        }

        copy(value);
        setCopiedTarget(target);
    };

    if (route.tab === 'settings') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
                <DetailList
                    title="Node Settings"
                    items={[
                        ['Node ID', formatScalar(item.id)],
                        ['Node Status', nodeStatusLabel],
                        ['Location', formatScalar(locationLabel)],
                        ['Location ID', formatScalar(item.location_id)],
                        ['FQDN', formatScalar(item.fqdn)],
                        ['Scheme', formatScalar(item.scheme)],
                        ['Maintenance', item.maintenance_mode ? 'Enabled' : 'Disabled'],
                    ]}
                />
                {connectivityPanel}
                <Panel title="Security" copy="Rotate the node deploy token if you need to reconnect Wings safely.">
                    <div className="admin-actions-grid">
                        <button
                            type="button"
                            className="admin-button"
                            disabled={busy === 'rotate-secret'}
                            onClick={async () => {
                                setBusy('rotate-secret');
                                setError(null);
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    await adminHttp.patch(`/api/application/nodes/${item.id}`, {
                                        name: item.name,
                                        description: item.description,
                                        location_id: item.location_id,
                                        fqdn: item.fqdn,
                                        scheme: item.scheme,
                                        public: item.public,
                                        behind_proxy: item.behind_proxy,
                                        maintenance_mode: item.maintenance_mode,
                                        memory: item.memory,
                                        memory_overallocate: item.memory_overallocate,
                                        disk: item.disk,
                                        disk_overallocate: item.disk_overallocate,
                                        upload_size: item.upload_size,
                                        daemon_listen: item.daemon_listen,
                                        daemon_sftp: item.daemon_sftp,
                                        daemon_base: daemonBase,
                                        reset_secret: true,
                                    });
                                    await refresh();
                                } catch (actionError) {
                                    setError(toHuman(actionError));
                                } finally {
                                    setBusy(null);
                                }
                            }}
                        >
                            <Glyph icon={LuShield} />
                            {busy === 'rotate-secret' ? 'Rotating...' : 'Rotate Deploy Token'}
                        </button>
                    </div>
                </Panel>
                <SimpleTable
                    title="Location References"
                    columns={['ID', 'Short Code', 'Description']}
                    rows={(refs.locations || []).map((location: Record<string, any>) => [location.id, location.short, location.long])}
                    emptyLabel="No location references were loaded."
                />
            </>
        );
    }

    if (route.tab === 'configuration') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
                {copiedTarget === 'command' ? <Banner tone="warning">Install command copied.</Banner> : null}
                {copiedTarget === 'yaml' ? <Banner tone="warning">YAML copied.</Banner> : null}
                <div className="admin-code-stack">
                    <Panel
                        title={installCommandLabel}
                        copy="Copy and run this on the node to write the current config.yml and restart Wings."
                        actions={configuration ? (
                            <button type="button" className="admin-button" onClick={() => copyText('command', installCommand)}>
                                <Glyph icon={LuCopy} />
                                {copiedTarget === 'command' ? 'Copied' : 'Copy Command'}
                            </button>
                        ) : null}
                    >
                        {configuration ? <pre className="admin-code-block">{installCommand}</pre> : <PanelLoading ariaLabel={'Loading node command'} embedded />}
                    </Panel>
                    <Panel
                        title="Wings Configuration"
                        copy="Copy this YAML into your node config file. It is generated from the current node settings and backend URL."
                        actions={configuration ? (
                            <button type="button" className="admin-button" onClick={() => copyText('yaml', configuration)}>
                                <Glyph icon={LuCopy} />
                                {copiedTarget === 'yaml' ? 'Copied' : 'Copy YAML'}
                            </button>
                        ) : null}
                    >
                        {configuration ? <pre className="admin-code-block">{configuration}</pre> : <PanelLoading ariaLabel={'Loading node configuration'} embedded />}
                    </Panel>
                </div>
                <Panel title="Node Runtime" copy="The generated command follows the node's current filesystem profile and uses the normalized daemon base path.">
                    <div className="admin-detail-grid">
                        {[
                            ['Daemon Base', formatScalar(daemonBase)],
                            ['Command Mode', prefersWindowsCommand ? 'PowerShell' : 'Linux shell'],
                            ['Config Path', prefersWindowsCommand ? 'C:\\ProgramData\\Pterodactyl\\config.yml' : '/etc/pterodactyl/config.yml'],
                        ].map(([label, value]) => (
                            <div key={label} className="admin-detail-grid__item">
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                </Panel>
            </>
        );
    }

    if (route.tab === 'allocation') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
                <Panel title="Create Allocations" copy="Enter an IP address or hostname and one or more ports or ranges. Ports must be greater than 1024.">
                    <form className="admin-form-grid admin-form-grid--stacked" onSubmit={async (event) => {
                        event.preventDefault();
                        setBusy('allocation-create');
                        setError(null);

                        const ip = allocationState.ip.trim();
                        const ports = allocationState.ports.split(/[\s,]+/).map((port) => port.trim()).filter(Boolean);

                        if (!ip) {
                            setError('Provide an IP address or hostname before creating allocations.');
                            setBusy(null);

                            return;
                        }

                        if (!ports.length) {
                            setError('Provide at least one port or port range before creating allocations.');
                            setBusy(null);

                            return;
                        }

                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.post(`/api/application/nodes/${item.id}/allocations`, {
                                ip,
                                alias: allocationState.alias.trim() || null,
                                ports,
                            });
                            setAllocationState({ ip: defaultAllocationIp, alias: '', ports: '' });
                            await refresh();
                            await loadAllocations();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        } finally {
                            setBusy(null);
                        }
                    }}>
                        <label className="admin-field"><span>IP Address</span><input value={allocationState.ip} onChange={(event) => {
                            const value = event.currentTarget.value;
                            setAllocationState((current) => ({ ...current, ip: value }));
                        }} /></label>
                        <label className="admin-field"><span>Alias</span><input value={allocationState.alias} onChange={(event) => {
                            const value = event.currentTarget.value;
                            setAllocationState((current) => ({ ...current, alias: value }));
                        }} /></label>
                        <label className="admin-field admin-field--compact"><span>Ports</span><input placeholder="25565, 25566-25570" value={allocationState.ports} onChange={(event) => {
                            const value = event.currentTarget.value;
                            setAllocationState((current) => ({ ...current, ports: value }));
                        }} /></label>
                        <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'allocation-create'}>
                            <Glyph icon={LuPlus} />
                            {busy === 'allocation-create' ? 'Creating...' : 'Create Allocations'}
                        </button>
                    </form>
                </Panel>
                <SimpleTable
                    title="Allocations"
                    columns={['IP', 'Alias', 'Port', 'Assigned', 'Actions']}
                    rows={allocations.map((allocation) => [
                        allocation.ip,
                        allocation.alias || '-',
                        allocation.port,
                        allocation.assigned ? 'Yes' : 'No',
                        <button
                            key={`allocation-${allocation.id}`}
                            type="button"
                            className="admin-button admin-button--danger"
                            onClick={async () => {
                                if (!window.confirm('Delete this allocation?')) {
                                    return;
                                }
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    await adminHttp.delete(`/api/application/nodes/${item.id}/allocations/${allocation.id}`);
                                    await refresh();
                                    await loadAllocations();
                                } catch (actionError) {
                                    setError(toHuman(actionError));
                                }
                            }}
                        >
                            Delete
                        </button>,
                    ])}
                    emptyLabel="No allocations are attached to this node yet."
                />
            </>
        );
    }

    if (route.tab === 'servers') {
        return (
            <SimpleTable
                title="Node Servers"
                columns={['ID', 'Name', 'Identifier', 'Status', 'Open']}
                rows={servers.map((server) => [
                    server.id,
                    server.name,
                    server.identifier,
                    server.status || 'unknown',
                    <Link key={`server-${server.id}`} href={`/admin/servers/view/${server.id}`} className="admin-inline-link">Open <Glyph icon={LuArrowUpRight} /></Link>,
                ])}
                emptyLabel="No servers are assigned to this node."
            />
        );
    }

    return (
        <>
            {error ? <Banner tone="danger">{error}</Banner> : null}
            <DetailList
                title="Capacity"
                items={[
                    ['Node Status', nodeStatusLabel],
                    ['Memory', `${item.memory} MiB`],
                    ['Disk', `${item.disk} MiB`],
                    ['Upload Size', `${item.upload_size ?? '-'} MiB`],
                    ['Daemon Port', String(item.daemon_listen ?? '-')],
                    ['SFTP Port', String(item.daemon_sftp ?? '-')],
                ]}
            />
            {connectivityPanel}
            <SimpleTable
                title="Allocations"
                columns={['IP', 'Alias', 'Port', 'Assigned']}
                rows={allocations.map((allocation) => [
                    allocation.ip,
                    allocation.alias || '-',
                    allocation.port,
                    allocation.assigned ? 'Yes' : 'No',
                ])}
                emptyLabel="No allocations are attached to this node yet."
            />
            <SimpleTable
                title="Servers"
                columns={['ID', 'Name', 'Identifier', 'Status']}
                rows={servers.map((server) => [
                    server.id,
                    server.name,
                    server.identifier,
                    server.status || 'unknown',
                ])}
                emptyLabel="No servers are assigned to this node."
            />
        </>
    );
}
