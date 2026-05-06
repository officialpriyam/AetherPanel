'use client';

import React, { useEffect, useState } from 'react';
import { LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import type { AdminRoute } from '../types';
import { buildInitialFieldState, formatScalar, getRelationItems } from '../utils';
import { Banner, DetailList, FieldEditor, Glyph, Panel, SimpleTable } from '../components/common';
import { serverBuildFields, serverStartupFields } from '../resources/definitions';
import { mapEntityToFormState } from '../resources/helpers';
import ServerReferenceHelp from './ServerReferenceHelp';

export default function ServerDetailPanels({ server, refs, refresh, route }: { server: Record<string, any>; refs: Record<string, any>; refresh: () => Promise<void>; route: AdminRoute }) {
    const [buildState, setBuildState] = useState(buildInitialFieldState(serverBuildFields, mapEntityToFormState('servers', server)));
    const [startupState, setStartupState] = useState(buildInitialFieldState(serverStartupFields, mapEntityToFormState('servers', server)));
    const [dbState, setDbState] = useState<Record<string, string>>({ database: '', remote: '%', host: '' });
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        setBuildState(buildInitialFieldState(serverBuildFields, mapEntityToFormState('servers', server)));
        setStartupState(buildInitialFieldState(serverStartupFields, mapEntityToFormState('servers', server)));
    }, [server]);

    const databases = getRelationItems(server, 'databases');
    const databaseHosts = refs.databaseHosts || [];

    const buildPanel = (
        <Panel title="Build Configuration" copy="Limits, allocation, and feature limits.">
            <form className="admin-form-grid admin-form-grid--stacked" onSubmit={async (event) => {
                event.preventDefault();
                setBusy('build');
                setError(null);
                try {
                    await adminHttp.get('/sanctum/csrf-cookie');
                    await adminHttp.patch(`/api/application/servers/${server.id}/build`, {
                        allocation: Number(buildState.allocation),
                        oom_disabled: buildState.oom_disabled === 'true',
                        limits: {
                            memory: Number(buildState.limits_memory || 0),
                            swap: Number(buildState.limits_swap || 0),
                            disk: Number(buildState.limits_disk || 0),
                            io: Number(buildState.limits_io || 500),
                            cpu: Number(buildState.limits_cpu || 0),
                            threads: buildState.limits_threads || null,
                        },
                        feature_limits: {
                            databases: Number(buildState.feature_limits_databases || 0),
                            allocations: Number(buildState.feature_limits_allocations || 0),
                            backups: Number(buildState.feature_limits_backups || 0),
                        },
                    });
                    await refresh();
                } catch (actionError) {
                    setError(toHuman(actionError));
                } finally {
                    setBusy(null);
                }
            }}>
                {serverBuildFields.map((field) => (
                    <FieldEditor key={field.key} field={field} value={buildState[field.key] ?? ''} onChange={(value) => setBuildState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                ))}
                <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'build'}><Glyph icon={LuSave} />{busy === 'build' ? 'Saving...' : 'Save Build'}</button>
            </form>
        </Panel>
    );

    const startupPanel = (
        <Panel title="Startup Configuration" copy="Startup command, egg, image, and environment values.">
            <form className="admin-form-grid admin-form-grid--stacked" onSubmit={async (event) => {
                event.preventDefault();
                setBusy('startup');
                setError(null);
                try {
                    await adminHttp.get('/sanctum/csrf-cookie');
                    await adminHttp.patch(`/api/application/servers/${server.id}/startup`, {
                        startup: startupState.startup,
                        egg: Number(startupState.egg),
                        image: startupState.image,
                        skip_scripts: startupState.skip_scripts === 'true',
                        environment: startupState.environment_json ? JSON.parse(startupState.environment_json) : {},
                    });
                    await refresh();
                } catch (actionError) {
                    setError(toHuman(actionError));
                } finally {
                    setBusy(null);
                }
            }}>
                {serverStartupFields.map((field) => (
                    <FieldEditor key={field.key} field={field} value={startupState[field.key] ?? ''} onChange={(value) => setStartupState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                ))}
                <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'startup'}><Glyph icon={LuSave} />{busy === 'startup' ? 'Saving...' : 'Save Startup'}</button>
            </form>
        </Panel>
    );

    const databasePanel = (
        <Panel title="Server Databases" copy="Application API-backed database management for this server.">
            <SimpleTable
                title="Existing Databases"
                columns={['Database', 'Username', 'Remote', 'Actions']}
                rows={databases.map((database) => [
                    database.database,
                    database.username,
                    database.remote,
                    <div key={database.id} className="admin-actions-grid admin-actions-grid--tight">
                        <button type="button" className="admin-button" onClick={async () => {
                            setBusy(`db-reset-${database.id}`);
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.post(`/api/application/servers/${server.id}/databases/${database.id}/reset-password`);
                                await refresh();
                            } catch (actionError) {
                                setError(toHuman(actionError));
                            } finally {
                                setBusy(null);
                            }
                        }}>Reset Password</button>,
                        <button type="button" className="admin-button admin-button--danger" onClick={async () => {
                            if (!window.confirm('Delete this database?')) {
                                return;
                            }
                            setBusy(`db-delete-${database.id}`);
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.delete(`/api/application/servers/${server.id}/databases/${database.id}`);
                                await refresh();
                            } catch (actionError) {
                                setError(toHuman(actionError));
                            } finally {
                                setBusy(null);
                            }
                        }}>Delete</button>,
                    </div>,
                ])}
                emptyLabel="No databases are attached to this server."
            />
            <form className="admin-form-grid admin-form-grid--stacked" onSubmit={async (event) => {
                event.preventDefault();
                setBusy('db-create');
                try {
                    await adminHttp.get('/sanctum/csrf-cookie');
                    await adminHttp.post(`/api/application/servers/${server.id}/databases`, {
                        database: dbState.database,
                        remote: dbState.remote,
                        host: Number(dbState.host),
                    });
                    setDbState({ database: '', remote: '%', host: '' });
                    await refresh();
                } catch (actionError) {
                    setError(toHuman(actionError));
                } finally {
                    setBusy(null);
                }
            }}>
                <label className="admin-field"><span>Name</span><input value={dbState.database} onChange={(event) => {
                    const value = event.currentTarget.value;
                    setDbState((current) => ({ ...current, database: value }));
                }} /></label>
                <label className="admin-field"><span>Remote</span><input value={dbState.remote} onChange={(event) => {
                    const value = event.currentTarget.value;
                    setDbState((current) => ({ ...current, remote: value }));
                }} /></label>
                <label className="admin-field">
                    <span>Host</span>
                    <select value={dbState.host} onChange={(event) => {
                        const value = event.currentTarget.value;
                        setDbState((current) => ({ ...current, host: value }));
                    }}>
                        <option value="">Select a database host</option>
                        {databaseHosts.map((host: Record<string, any>) => (
                            <option key={host.id} value={String(host.id)}>
                                {`#${host.id} - ${host.name} (${host.host}:${host.port})`}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'db-create'}><Glyph icon={LuPlus} />{busy === 'db-create' ? 'Creating...' : 'Create Database'}</button>
            </form>
        </Panel>
    );

    const managePanel = (
        <Panel title="Manage Server" copy="Suspend, unsuspend, reinstall, or remove this server.">
            <div className="admin-actions-grid">
                <button type="button" className="admin-button" onClick={() => runServerAction(server.id, 'suspend', setError, refresh)}>Suspend</button>
                <button type="button" className="admin-button" onClick={() => runServerAction(server.id, 'unsuspend', setError, refresh)}>Unsuspend</button>
                <button type="button" className="admin-button" onClick={() => runServerAction(server.id, 'reinstall', setError, refresh)}>Reinstall</button>
                <button type="button" className="admin-button admin-button--danger" onClick={async () => {
                    if (!window.confirm('Delete this server?')) {
                        return;
                    }
                    try {
                        await adminHttp.get('/sanctum/csrf-cookie');
                        await adminHttp.delete(`/api/application/servers/${server.id}`);
                        window.location.href = '/admin/servers';
                    } catch (actionError) {
                        setError(toHuman(actionError));
                    }
                }}><Glyph icon={LuTrash2} />Delete Server</button>
            </div>
            <ServerReferenceHelp refs={refs} />
        </Panel>
    );

    if (route.tab === 'build') {
        return <>{error ? <Banner tone="danger">{error}</Banner> : null}{buildPanel}</>;
    }

    if (route.tab === 'startup') {
        return <>{error ? <Banner tone="danger">{error}</Banner> : null}{startupPanel}</>;
    }

    if (route.tab === 'database') {
        return <>{error ? <Banner tone="danger">{error}</Banner> : null}{databasePanel}</>;
    }

    if (route.tab === 'manage') {
        return <>{error ? <Banner tone="danger">{error}</Banner> : null}{managePanel}</>;
    }

    if (route.tab === 'details') {
        return (
            <>
                {error ? <Banner tone="danger">{error}</Banner> : null}
                <div className="admin-split-grid">
                    <DetailList
                        title="Detail References"
                        items={[
                            ['Server ID', formatScalar(server.id)],
                            ['Owner', formatScalar(getRelationItems(server, 'user')[0]?.username ?? server.user)],
                            ['Owner ID', formatScalar(server.user)],
                            ['Node', formatScalar(getRelationItems(server, 'node')[0]?.name ?? server.node)],
                            ['Node ID', formatScalar(server.node)],
                            ['External ID', formatScalar(server.external_id)],
                            ['Description', formatScalar(server.description)],
                        ]}
                    />
                    <ServerReferenceHelp refs={refs} />
                </div>
            </>
        );
    }

    return (
        <>
            {error ? <Banner tone="danger">{error}</Banner> : null}
            <div className="admin-split-grid">
                <DetailList
                    title="Server Overview"
                    items={[
                        ['Server ID', formatScalar(server.id)],
                        ['Owner', formatScalar(getRelationItems(server, 'user')[0]?.username ?? server.user)],
                        ['Owner ID', formatScalar(server.user)],
                        ['Node', formatScalar(getRelationItems(server, 'node')[0]?.name ?? server.node)],
                        ['Node ID', formatScalar(server.node)],
                        ['Primary Allocation', formatScalar(server.allocation)],
                        ['Egg', formatScalar(getRelationItems(server, 'egg')[0]?.name ?? server.egg)],
                    ]}
                />
                <DetailList
                    title="Runtime"
                    items={[
                        ['Image', formatScalar(server.container?.image)],
                        ['Startup', formatScalar(server.container?.startup_command)],
                        ['Status', formatScalar(server.status)],
                        ['Databases', String(databases.length)],
                    ]}
                />
            </div>
            <div className="admin-split-grid">
                {buildPanel}
                {startupPanel}
            </div>
            <div className="admin-split-grid">
                {databasePanel}
                {managePanel}
            </div>
        </>
    );
}

async function runServerAction(serverId: number, action: 'suspend' | 'unsuspend' | 'reinstall', setError: (value: string | null) => void, refresh: () => Promise<void>) {
    try {
        await adminHttp.get('/sanctum/csrf-cookie');
        await adminHttp.post(`/api/application/servers/${serverId}/${action}`);
        await refresh();
    } catch (error) {
        setError(toHuman(error));
    }
}
