'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { LuArrowUpRight, LuPlus, LuSave, LuSearch, LuTrash2 } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import { buildInitialFieldState, get, normalizeApiPayload } from '../utils';
import type { AdminRoute, ResourceConfig, ResourceSection } from '../types';
import type { FormField } from '../config';
import PanelLoading from '@/panel/PanelLoading';
import {
    buildEggEnvironmentState,
    buildCreatePayload,
    buildSummaryItems,
    buildUpdatePayload,
    getEggVariableDefinitions,
    getEggRuntimeDefaults,
    mapEntityToFormState,
    normalizeDaemonBasePathValue,
} from '../resources';
import { DAEMON_BASE_PRESETS } from '../resources/definitions';
import { Banner, DetailList, FieldEditor, Glyph, Panel, SubnavTabs } from '../components/common';
import NodeReferenceHelp from '../sections/NodeReferenceHelp';
import ServerReferenceHelp from '../sections/ServerReferenceHelp';

type CreateStep = {
    label: string;
    fields: FormField[];
};

const CREATE_STEP_LAYOUTS: Partial<Record<ResourceSection, Array<{ label: string; keys: string[] }>>> = {
    users: [
        { label: 'Identity', keys: ['email', 'username', 'first_name', 'last_name'] },
        { label: 'Access', keys: ['password', 'root_admin', 'language'] },
    ],
    nodes: [
        { label: 'Basics', keys: ['name', 'description', 'location_id', 'fqdn', 'scheme', 'public', 'behind_proxy', 'maintenance_mode'] },
        { label: 'Resources', keys: ['memory', 'memory_overallocate', 'disk', 'disk_overallocate', 'upload_size'] },
        { label: 'Daemon', keys: ['daemon_base_profile', 'daemon_base', 'daemon_listen', 'daemon_sftp'] },
    ],
    servers: [
        { label: 'Basics', keys: ['name', 'description', 'user', 'nest', 'egg', 'allocation_default'] },
        { label: 'Runtime', keys: ['docker_image', 'startup'] },
        { label: 'Limits', keys: ['limits_memory', 'limits_swap', 'limits_disk', 'limits_io', 'limits_cpu', 'limits_threads'] },
        { label: 'Features', keys: ['feature_limits_databases', 'feature_limits_allocations', 'feature_limits_backups', 'skip_scripts', 'oom_disabled', 'start_on_completion'] },
    ],
};

const chunkFields = (fields: FormField[], size: number): FormField[][] => {
    const chunks: FormField[][] = [];
    for (let index = 0; index < fields.length; index += size) {
        chunks.push(fields.slice(index, index + size));
    }

    return chunks;
};

const resolveCreateSteps = (section: ResourceSection, fields: FormField[]): CreateStep[] => {
    const predefinedLayout = CREATE_STEP_LAYOUTS[section];
    if (!predefinedLayout?.length) {
        return chunkFields(fields, 6).map((stepFields, index) => ({
            label: `Step ${index + 1}`,
            fields: stepFields,
        }));
    }

    const fieldMap = new Map(fields.map((field) => [field.key, field]));
    const consumed = new Set<string>();

    const mappedSteps = predefinedLayout
        .map((step) => {
            const stepFields = step.keys
                .map((key) => {
                    const match = fieldMap.get(key);
                    if (match) {
                        consumed.add(key);
                    }

                    return match;
                })
                .filter((field): field is FormField => Boolean(field));

            return {
                label: step.label,
                fields: stepFields,
            };
        })
        .filter((step) => step.fields.length > 0);

    const remaining = fields.filter((field) => !consumed.has(field.key));
    if (remaining.length > 0) {
        mappedSteps.push({ label: 'Advanced', fields: remaining });
    }

    return mappedSteps;
};

function ResourcePage({ route, config }: { route: AdminRoute & { section: ResourceSection }; config: ResourceConfig }) {
    const [items, setItems] = useState<Record<string, any>[]>([]);
    const [item, setItem] = useState<Record<string, any> | null>(null);
    const [refs, setRefs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [formState, setFormState] = useState<Record<string, string>>({});
    const [createStepIndex, setCreateStepIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
    const nodeDaemonDefaults = DAEMON_BASE_PRESETS;
    const createSteps = useMemo(
        () => (config.createFields ? resolveCreateSteps(route.section, config.createFields) : []),
        [route.section, config.createFields]
    );
    const isFinalCreateStep = createStepIndex >= createSteps.length - 1;
    const activeCreateFields = createSteps[createStepIndex]?.fields ?? config.createFields ?? [];
    const serverVariableDefinitions = useMemo(
        () => route.section === 'servers' && route.view === 'new' ? getEggVariableDefinitions(refs, formState.egg) : [],
        [formState.egg, refs, route.section, route.view]
    );
    const visibleServerVariables = useMemo(
        () => serverVariableDefinitions.filter((variable) => variable.user_viewable || variable.user_editable || variable.required),
        [serverVariableDefinitions]
    );

    const refresh = async () => {
        setLoading(true);
        setError(null);

        try {
            const tasks: Promise<void>[] = [];

            if (route.view === 'list') {
                const listUrl = config.listInclude ? `${config.listEndpoint}?per_page=200&include=${config.listInclude}` : `${config.listEndpoint}?per_page=200`;
                tasks.push(
                    adminHttp.get(listUrl).then(({ data }) => {
                        setItems(Array.isArray(normalizeApiPayload(data)) ? normalizeApiPayload(data) : normalizeApiPayload(data?.data ?? data) || []);
                    })
                );
            }

            if (route.view === 'detail' && route.id) {
                const detailUrl = config.detailInclude ? `${config.detailEndpoint(route.id)}?include=${config.detailInclude}` : config.detailEndpoint(route.id);
                tasks.push(
                    adminHttp.get(detailUrl).then(({ data }) => {
                        const normalized = normalizeApiPayload(data?.data ?? data);
                        setItem(normalized);
                        if (config.updateFields) {
                            const initial = buildInitialFieldState(config.updateFields, mapEntityToFormState(route.section, normalized));
                            setFormState(initial);
                        }
                    })
                );
            }

            if (config.loadRefs && (route.view === 'new' || route.view === 'detail')) {
                tasks.push(
                    config.loadRefs().then((nextRefs) => {
                        setRefs(nextRefs);
                    })
                );
            }

            if (route.view === 'new' && config.createFields) {
                const initial = buildInitialFieldState(config.createFields, {});
                if (route.section === 'nodes') {
                    const profile = initial.daemon_base_profile === 'windows' ? 'windows' : 'linux';
                    if (!initial.daemon_base) {
                        initial.daemon_base = nodeDaemonDefaults[profile];
                    }
                }
                setFormState(initial);
            }

            await Promise.all(tasks);
        } catch (loadError) {
            setError(toHuman(loadError));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [route.section, route.view, route.id]);

    useEffect(() => {
        setCreateStepIndex(0);
    }, [route.section, route.view]);

    const filteredItems = useMemo(() => {
        if (!query.trim()) {
            return items;
        }

        const needle = query.toLowerCase();
        return items.filter((entry) => config.searchKeys.some((key) => String(get(entry, key, '')).toLowerCase().includes(needle)));
    }, [items, query, config]);

    const onFieldChange = (fieldKey: string, value: string) => {
        setFormState((current) => {
            const next = { ...current, [fieldKey]: value };

            if (route.section === 'nodes' && fieldKey === 'daemon_base_profile') {
                const selectedProfile = value === 'windows' ? 'windows' : 'linux';
                const currentBase = normalizeDaemonBasePathValue((current.daemon_base || '').trim());
                const shouldSyncBasePath =
                    currentBase === '' || currentBase === nodeDaemonDefaults.linux || currentBase === nodeDaemonDefaults.windows;

                if (shouldSyncBasePath) {
                    next.daemon_base = nodeDaemonDefaults[selectedProfile];
                }
            }

            if (route.section === 'servers' && fieldKey === 'egg') {
                const defaults = getEggRuntimeDefaults(refs, value);
                const nextEnvironment = buildEggEnvironmentState(refs, value, current);

                if (defaults.egg?.nest_id) {
                    next.nest = String(defaults.egg.nest_id);
                }

                if (defaults.image) {
                    next.docker_image = defaults.image;
                }

                if (defaults.startup) {
                    next.startup = defaults.startup;
                }

                Object.assign(next, nextEnvironment);
            }

            if (route.section === 'servers' && fieldKey === 'nest') {
                next.egg = '';
                next.docker_image = '';
                next.startup = '';

                Object.keys(next)
                    .filter((key) => key.startsWith('env__'))
                    .forEach((key) => {
                        delete next[key];
                    });
            }

            return next;
        });
    };

    const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!config.createEndpoint || !config.createFields) {
            return;
        }

        if (createSteps.length > 1 && !isFinalCreateStep) {
            setCreateStepIndex((current) => Math.min(current + 1, createSteps.length - 1));
            return;
        }

        setSubmitting(true);
        setError(null);
        setMessage(null);
        setGeneratedSecret(null);

        try {
            await adminHttp.get('/sanctum/csrf-cookie');
            const payload = buildCreatePayload(route.section, formState, refs);
            const response = await adminHttp.post(config.createEndpoint, payload);
            setMessage(`${config.title.slice(0, -1)} created successfully.`);
            if (response?.data?.data?.plaintext) {
                setGeneratedSecret(response.data.data.plaintext);
            }
            setFormState(buildInitialFieldState(config.createFields, {}));
            setCreateStepIndex(0);
        } catch (saveError) {
            setError(toHuman(saveError));
        } finally {
            setSubmitting(false);
        }
    };

    const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!config.updateEndpoint || !route.id) {
            return;
        }

        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            await adminHttp.get('/sanctum/csrf-cookie');
            const payload = buildUpdatePayload(route.section, route.tab, formState);
            await adminHttp.patch(config.updateEndpoint(route.id), payload);
            await refresh();
            setMessage(`${config.title.slice(0, -1)} updated successfully.`);
        } catch (saveError) {
            setError(toHuman(saveError));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-page-stack">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {message ? <Banner tone="warning">{message}</Banner> : null}
            {generatedSecret ? <Banner tone="warning">Copy this API key now: {generatedSecret}</Banner> : null}
            {route.view === 'list' ? (
                <Panel
                    title={`${config.title} List`}
                    copy={config.emptyMessage}
                    actions={config.createFields ? <Link href={`/admin/${config.section}/new`} className="admin-button admin-button--primary"><Glyph icon={LuPlus} />Create New</Link> : null}
                >
                    <div className="admin-toolbar">
                        <label className="admin-search">
                            <Glyph icon={LuSearch} />
                            <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={`Search ${config.title.toLowerCase()}...`} />
                        </label>
                    </div>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {config.columns.map((column, index) => <th key={index}>{column.label}</th>)}
                                    <th>Open</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((entry) => (
                                    <tr key={entry.id || entry.identifier}>
                                        {config.columns.map((column, index) => <td key={index}>{column.render(entry)}</td>)}
                                        <td>
                                            <Link href={`/admin/${config.section}/view/${entry.id}`} className="admin-inline-link">Open <Glyph icon={LuArrowUpRight} /></Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!filteredItems.length ? <div className="admin-empty">{config.emptyMessage}</div> : null}
                    {config.renderListExtras ? config.renderListExtras(filteredItems) : null}
                </Panel>
            ) : null}
            {route.view === 'new' && config.createFields ? (
                <form onSubmit={submitCreate} className="admin-form-stack">
                    <Panel title={config.createTitle || `Create ${config.title.slice(0, -1)}`} copy="Fill out the required fields below.">
                        {createSteps.length > 1 ? (
                            <div className="admin-stepper" role="list" aria-label="Create flow steps">
                                {createSteps.map((step, index) => (
                                    <button
                                        key={step.label}
                                        type="button"
                                        className={`admin-stepper__item${index === createStepIndex ? ' is-active' : ''}${index < createStepIndex ? ' is-done' : ''}`}
                                        onClick={() => setCreateStepIndex(index)}
                                        role="listitem"
                                    >
                                        <span className="admin-stepper__index">{index + 1}</span>
                                        <span className="admin-stepper__label">{step.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        <div className="admin-form-grid admin-form-grid--stacked">
                            {activeCreateFields.map((field) => (
                                <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => onFieldChange(field.key, value)} refs={refs} values={formState} />
                            ))}
                        </div>
                        {route.section === 'servers' && formState.egg && activeCreateFields.some((field) => ['nest', 'egg', 'docker_image', 'startup'].includes(field.key)) ? (
                            <section className="admin-inline-section">
                                <div className="admin-inline-section__header">
                                    <strong>Shell Configuration</strong>
                                    <small>Required shell variables are preloaded with defaults. Adjust only the values that need to change for this server.</small>
                                </div>
                                <div className="admin-form-grid admin-form-grid--stacked">
                                    {visibleServerVariables.length > 0 ? visibleServerVariables.map((variable) => {
                                        const fieldKey = `env__${variable.env_variable}`;
                                        const isRequired = String(variable.rules || '').split('|').includes('required');

                                        return (
                                            <label key={fieldKey} className="admin-field">
                                                <span>{variable.name}{isRequired ? ' *' : ''}</span>
                                                <input
                                                    value={formState[fieldKey] ?? String(variable.default_value ?? '')}
                                                    onChange={(event) => onFieldChange(fieldKey, event.currentTarget.value)}
                                                    placeholder={String(variable.default_value ?? '')}
                                                />
                                                {variable.description ? <small>{variable.description}</small> : null}
                                            </label>
                                        );
                                    }) : <div className="admin-empty">This shell does not expose editable server variables.</div>}
                                </div>
                            </section>
                        ) : null}
                        {route.section === 'servers' ? <ServerReferenceHelp refs={refs} /> : null}
                        {route.section === 'nodes' ? <NodeReferenceHelp refs={refs} /> : null}
                    </Panel>
                    <div className="admin-actions-row">
                        {createSteps.length > 1 && createStepIndex > 0 ? (
                            <button type="button" className="admin-button" onClick={() => setCreateStepIndex((current) => Math.max(0, current - 1))}>
                                Previous Step
                            </button>
                        ) : null}
                        <button type="submit" className="admin-button admin-button--primary" disabled={submitting}>
                            <Glyph icon={LuSave} />
                            {submitting ? 'Creating...' : isFinalCreateStep ? 'Create' : 'Next Step'}
                        </button>
                    </div>
                </form>
            ) : null}
            {route.view === 'detail' ? (
                <>
                    {loading ? <PanelLoading ariaLabel={'Loading resource details'} embedded /> : null}
                    {!loading && item ? (
                        <>
                            {config.detailTabs ? <SubnavTabs baseHref={`/admin/${config.section}/view/${route.id}`} items={config.detailTabs} activeId={route.tab} /> : null}
                            <DetailList
                                title={`${config.title.slice(0, -1)} Summary`}
                                items={buildSummaryItems(route.section, item)}
                            />
                            {config.updateFields && config.updateEndpoint && (!config.editTabId || config.editTabId === route.tab) ? (
                                <form onSubmit={submitUpdate} className="admin-form-stack">
                                    <Panel title="Edit" copy="Update the fields below and save when you are ready.">
                                        <div className="admin-form-grid admin-form-grid--stacked">
                                            {config.updateFields.map((field) => (
                                                <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => onFieldChange(field.key, value)} refs={refs} values={formState} />
                                            ))}
                                        </div>
                                    </Panel>
                                    <div className="admin-actions-row">
                                        <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />{submitting ? 'Saving...' : 'Save'}</button>
                                        {config.deleteEndpoint ? (
                                            <button
                                                type="button"
                                                className="admin-button admin-button--danger"
                                                onClick={async () => {
                                                    if (!route.id || !config.deleteEndpoint || !window.confirm(`Delete this ${config.title.slice(0, -1).toLowerCase()}?`)) {
                                                        return;
                                                    }
                                                    try {
                                                        await adminHttp.get('/sanctum/csrf-cookie');
                                                        await adminHttp.delete(config.deleteEndpoint(route.id));
                                                        window.location.href = `/admin/${config.section}`;
                                                    } catch (deleteError) {
                                                        setError(toHuman(deleteError));
                                                    }
                                                }}
                                            >
                                                <Glyph icon={LuTrash2} />
                                                {config.deleteLabel || 'Delete'}
                                            </button>
                                        ) : null}
                                    </div>
                                </form>
                            ) : null}
                            {config.renderDetailExtras ? config.renderDetailExtras(item, refs, refresh, route) : null}
                        </>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

export default ResourcePage;
