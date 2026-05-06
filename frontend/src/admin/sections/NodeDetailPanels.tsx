'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LuArrowUpRight, LuPlus, LuShield } from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { adminHttp, toHuman } from '../api';
import type { AdminRoute } from '../types';
import { Banner, DetailList, Glyph, Panel, SimpleTable } from '../components/common';
import { formatScalar, getRelationItems } from '../utils';

export default function NodeDetailPanels({ item, refs, refresh, route }: { item: Record<string, any>; refs: Record<string, any>; refresh: () => Promise<void>; route: AdminRoute }) {
    const [configuration, setConfiguration] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [allocationState, setAllocationState] = useState({ ip: '', alias: '', ports: '' });

    const allocations = getRelationItems(item, 'allocations');
    const servers = getRelationItems(item, 'servers');
    const defaultAllocationIp = allocations[0]?.ip || item.fqdn || '';

    useEffect(() => {
        setAllocationState({ ip: defaultAllocationIp, alias: '', ports: '' });
    }, [item.id, defaultAllocationIp]);

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

                setConfiguration(typeof data === 'string' ? data : '');
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

    if (route.tab === 'settings') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
                <DetailList
                    title="Node Settings"
                    items={[
                        ['Node ID', formatScalar(item.id)],
                        ['Location', formatScalar(getRelationItems(item, 'location')[0]?.short ?? item.location_id)],
                        ['Location ID', formatScalar(item.location_id)],
                        ['FQDN', formatScalar(item.fqdn)],
                        ['Scheme', formatScalar(item.scheme)],
                        ['Maintenance', item.maintenance_mode ? 'Enabled' : 'Disabled'],
                    ]}
                />
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
                                        daemon_base: item.daemon_base,
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
                <Panel title="Wings Configuration" copy="Copy this YAML into your node config file. It is generated from the current node settings and backend URL.">
                    {configuration ? <pre className="admin-code-block">{configuration}</pre> : <PanelLoading ariaLabel={'Loading node configuration'} embedded />}
                </Panel>
            </>
        );
    }

    if (route.tab === 'allocation') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
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
                        <label className="admin-field"><span>Ports</span><textarea rows={4} value={allocationState.ports} onChange={(event) => {
                            const value = event.currentTarget.value;
                            setAllocationState((current) => ({ ...current, ports: value }));
                        }} /></label>
                        <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'allocation-create'}>
                            <Glyph icon={LuPlus} />
                            {busy === 'allocation-create' ? 'Creating...' : 'Create Allocations'}
                        </button>
                    </form>
                </Panel>
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
                    ['Memory', `${item.memory} MiB`],
                    ['Disk', `${item.disk} MiB`],
                    ['Upload Size', `${item.upload_size ?? '-'} MiB`],
                    ['Daemon Port', String(item.daemon_listen ?? '-')],
                    ['SFTP Port', String(item.daemon_sftp ?? '-')],
                ]}
            />
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
