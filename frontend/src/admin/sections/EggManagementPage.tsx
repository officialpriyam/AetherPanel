'use client';

import React, { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuDownload, LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { adminHttp, toHuman } from '../api';
import type { AdminRoute } from '../types';
import { buildInitialFieldState, formatScalar } from '../utils';
import { Banner, DetailList, FieldEditor, Glyph, Panel, SimpleTable, SubnavTabs } from '../components/common';
import { eggDetailTabs, eggFields, eggScriptFields, eggVariableFields, loadNestRefs } from '../resources/definitions';

export default function EggManagementPage({ route }: { route: AdminRoute }) {
    const [item, setItem] = useState<Record<string, any> | null>(null);
    const [refs, setRefs] = useState<Record<string, any>>({});
    const [formState, setFormState] = useState<Record<string, string>>(buildInitialFieldState(eggFields, {
        force_outgoing_ip: false,
    }));
    const [scriptState, setScriptState] = useState<Record<string, string>>(buildInitialFieldState(eggScriptFields, {
        script_is_privileged: false,
    }));
    const [variableState, setVariableState] = useState<Record<string, string>>(buildInitialFieldState(eggVariableFields, {
        user_viewable: false,
        user_editable: false,
    }));
    const [variableEditStates, setVariableEditStates] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(route.view === 'detail');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [catalogOs, setCatalogOs] = useState<'linux' | 'windows'>('linux');
    const [catalogPage, setCatalogPage] = useState(1);
    const [catalogQuery, setCatalogQuery] = useState('');
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogItems, setCatalogItems] = useState<Record<string, any>[]>([]);
    const [catalogMeta, setCatalogMeta] = useState({ current_page: 1, total_pages: 1, total: 0 });
    const [selectedCatalogItems, setSelectedCatalogItems] = useState<string[]>([]);

    const refresh = async () => {
        setLoading(true);
        setError(null);

        try {
            const nextRefs = await loadNestRefs();
            setRefs(nextRefs);

            if (route.view === 'detail' && route.id) {
                const { data } = await adminHttp.get(`/api/admin/eggs/${route.id}`);
                const nextItem = data?.data ?? null;
                setItem(nextItem);
                setFormState(buildInitialFieldState(eggFields, mapEggToFormState(nextItem)));
                setScriptState(buildInitialFieldState(eggScriptFields, mapEggScriptToFormState(nextItem)));
                setVariableEditStates((nextItem?.variables || []).reduce((carry: Record<string, Record<string, string>>, variable: Record<string, any>) => {
                    carry[String(variable.id)] = buildInitialFieldState(eggVariableFields, mapEggVariableToFormState(variable));
                    return carry;
                }, {}));
            } else {
                setItem(null);
                setFormState(buildInitialFieldState(eggFields, { force_outgoing_ip: false, nest_id: formState.nest_id }));
                setScriptState(buildInitialFieldState(eggScriptFields, { script_is_privileged: false }));
                setVariableEditStates({});
            }
        } catch (loadError) {
            setError(toHuman(loadError));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [route.view, route.id]);

    useEffect(() => {
        if (route.view !== 'new' || !formState.nest_id) {
            setCatalogItems([]);
            setSelectedCatalogItems([]);
            return;
        }

        let active = true;
        setCatalogLoading(true);

        adminHttp.get('/api/admin/propel/hive', {
            params: {
                os: catalogOs,
                page: catalogPage,
                query: catalogQuery || undefined,
            },
        })
            .then(({ data }) => {
                if (!active) {
                    return;
                }

                const nextData = data?.data ?? {};
                setCatalogItems(nextData.eggs || []);
                setCatalogMeta({
                    current_page: nextData.current_page || 1,
                    total_pages: nextData.total_pages || 1,
                    total: nextData.total || 0,
                });
            })
            .catch((loadError) => {
                if (active) {
                    setError(toHuman(loadError));
                }
            })
            .finally(() => {
                if (active) {
                    setCatalogLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [route.view, formState.nest_id, catalogOs, catalogPage, catalogQuery]);

    return (
        <div className="admin-page-stack">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {message ? <Banner tone="warning">{message}</Banner> : null}
            {loading ? <PanelLoading ariaLabel={'Loading shell details'} embedded /> : null}
            {!loading && route.view === 'new' ? (
                <form className="admin-form-stack" onSubmit={async (event) => {
                    event.preventDefault();
                    setSubmitting(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await adminHttp.get('/sanctum/csrf-cookie');
                        const selectedNestId = formState.nest_id;
                        await adminHttp.post('/api/admin/eggs', buildEggPayload(formState));
                        setMessage('Shell created successfully.');
                        setFormState(buildInitialFieldState(eggFields, { force_outgoing_ip: false, nest_id: selectedNestId }));
                    } catch (saveError) {
                        setError(toHuman(saveError));
                    } finally {
                        setSubmitting(false);
                    }
                }}>
                    <Panel title="Import Shells" copy="Choose a core, pick Linux or Windows, then import shells directly from the Propel catalog.">
                        <div className="admin-form-grid admin-form-grid--stacked">
                            <label className="admin-field">
                                <span>Core</span>
                                <select value={formState.nest_id ?? ''} onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setFormState((current) => ({ ...current, nest_id: value }));
                                    setCatalogPage(1);
                                    setSelectedCatalogItems([]);
                                }}>
                                    <option value="">Select a core</option>
                                    {(refs.nests || []).map((nest: Record<string, any>) => (
                                        <option key={nest.id} value={String(nest.id)}>
                                            {`#${nest.id} - ${nest.name}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="admin-field admin-field--compact">
                                <span>Operating System</span>
                                <select value={catalogOs} onChange={(event) => {
                                    setCatalogOs(event.currentTarget.value === 'windows' ? 'windows' : 'linux');
                                    setCatalogPage(1);
                                    setSelectedCatalogItems([]);
                                }}>
                                    <option value="linux">Linux</option>
                                    <option value="windows">Windows</option>
                                </select>
                            </label>
                            <label className="admin-field">
                                <span>Catalog Search</span>
                                <input value={catalogQuery} onChange={(event) => {
                                    setCatalogQuery(event.currentTarget.value);
                                    setCatalogPage(1);
                                }} placeholder="Search Minecraft, Purpur, Paper, Bungeecord..." />
                            </label>
                        </div>
                        <SimpleTable
                            title="Propel Shell Catalog"
                            columns={['Pick', 'Shell', 'Identifier', 'Description']}
                            rows={catalogItems.map((egg) => [
                                <input
                                    key={`select-${egg.identifier}`}
                                    type="checkbox"
                                    checked={selectedCatalogItems.includes(egg.identifier)}
                                    onChange={(event) => setSelectedCatalogItems((current) => (
                                        event.currentTarget.checked
                                            ? [...current, egg.identifier]
                                            : current.filter((identifier) => identifier !== egg.identifier)
                                    ))}
                                />,
                                egg.display_name || egg.name,
                                egg.identifier,
                                egg.description || '-',
                            ])}
                            emptyLabel={formState.nest_id ? (catalogLoading ? 'Loading shells...' : 'No shells matched the current filter.') : 'Select a core to load the Propel shell catalog.'}
                        />
                        <div className="admin-actions-row">
                            <button type="button" className="admin-button" disabled={catalogPage <= 1 || catalogLoading} onClick={() => setCatalogPage((current) => Math.max(1, current - 1))}><Glyph icon={LuChevronLeft} />Previous Page</button>
                            <button type="button" className="admin-button" disabled={catalogPage >= catalogMeta.total_pages || catalogLoading} onClick={() => setCatalogPage((current) => current + 1)}>Next Page<Glyph icon={LuChevronRight} /></button>
                            <button type="button" className="admin-button admin-button--primary" disabled={submitting || !formState.nest_id || selectedCatalogItems.length === 0} onClick={async () => {
                                setSubmitting(true);
                                setError(null);
                                setMessage(null);
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    const response = await adminHttp.post('/api/admin/propel/import', {
                                        nest_id: Number(formState.nest_id),
                                        os: catalogOs,
                                        identifiers: selectedCatalogItems,
                                    });
                                    const imported = response?.data?.data?.imported || [];
                                    setSelectedCatalogItems([]);
                                    setMessage(`${imported.length} shell${imported.length === 1 ? '' : 's'} imported successfully.`);
                                    await refresh();
                                } catch (importError) {
                                    setError(toHuman(importError));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}><Glyph icon={LuDownload} />{submitting ? 'Importing...' : 'Import Selected Shells'}</button>
                        </div>
                    </Panel>
                    <Panel title="Create Shell" copy="Build a shell manually when you are not importing from the Propel catalog.">
                        <div className="admin-form-grid admin-form-grid--stacked">
                            {eggFields.map((field) => (
                                <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => setFormState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                            ))}
                        </div>
                    </Panel>
                    <div className="admin-actions-row">
                        <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />{submitting ? 'Creating...' : 'Create Shell'}</button>
                    </div>
                </form>
            ) : null}
            {!loading && route.view === 'detail' && item ? (
                <>
                    <SubnavTabs baseHref={`/admin/nests/egg/${route.id}`} items={eggDetailTabs} activeId={route.tab} />
                    <DetailList
                        title="Shell Summary"
                        items={[
                            ['ID', String(item.id ?? '-')],
                            ['Core', formatScalar(item.nest?.name ?? item.nest_id)],
                            ['Author', formatScalar(item.author)],
                            ['Servers', String((item.servers || []).length)],
                            ['Variables', String((item.variables || []).length)],
                            ['Updated', formatScalar(item.updated_at)],
                        ]}
                    />
                    {route.tab === 'variables' ? (
                        <>
                            <form className="admin-form-stack" onSubmit={async (event) => {
                                event.preventDefault();
                                setSubmitting(true);
                                setError(null);
                                setMessage(null);
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    await adminHttp.post(`/api/admin/eggs/${item.id}/variables`, buildEggVariablePayload(variableState));
                                    setVariableState(buildInitialFieldState(eggVariableFields, { user_viewable: false, user_editable: false }));
                                    setMessage('Variable created successfully.');
                                    await refresh();
                                } catch (saveError) {
                                    setError(toHuman(saveError));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}>
                                <Panel title="Create Variable" copy="Add a new environment variable to this shell.">
                                    <div className="admin-form-grid admin-form-grid--stacked">
                                        {eggVariableFields.map((field) => (
                                            <FieldEditor key={field.key} field={field} value={variableState[field.key] ?? ''} onChange={(value) => setVariableState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                                        ))}
                                    </div>
                                </Panel>
                                <div className="admin-actions-row">
                                    <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuPlus} />{submitting ? 'Creating...' : 'Create Variable'}</button>
                                </div>
                            </form>
                            {(item.variables || []).map((variable: Record<string, any>) => {
                                const variableKey = String(variable.id);
                                const variableEditState = variableEditStates[variableKey] || buildInitialFieldState(eggVariableFields, mapEggVariableToFormState(variable));

                                return (
                                    <form key={variable.id} className="admin-form-stack" onSubmit={async (event) => {
                                        event.preventDefault();
                                        setSubmitting(true);
                                        setError(null);
                                        setMessage(null);
                                        try {
                                            await adminHttp.get('/sanctum/csrf-cookie');
                                            await adminHttp.patch(`/api/admin/eggs/${item.id}/variables/${variable.id}`, buildEggVariablePayload(variableEditState));
                                            setMessage(`Variable ${variable.name} updated successfully.`);
                                            await refresh();
                                        } catch (saveError) {
                                            setError(toHuman(saveError));
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}>
                                        <Panel title={variable.name} copy={variable.env_variable}>
                                            <div className="admin-form-grid admin-form-grid--stacked">
                                                {eggVariableFields.map((field) => (
                                                    <FieldEditor
                                                        key={`${variable.id}-${field.key}`}
                                                        field={field}
                                                        value={variableEditState[field.key] ?? ''}
                                                        onChange={(value) => setVariableEditStates((current) => ({
                                                            ...current,
                                                            [variableKey]: {
                                                                ...variableEditState,
                                                                [field.key]: value,
                                                            },
                                                        }))}
                                                        refs={refs}
                                                    />
                                                ))}
                                            </div>
                                        </Panel>
                                        <div className="admin-actions-row">
                                            <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />Save Variable</button>
                                            <button type="button" className="admin-button admin-button--danger" onClick={async () => {
                                                if (!window.confirm('Delete this variable?')) {
                                                    return;
                                                }
                                                try {
                                                    await adminHttp.get('/sanctum/csrf-cookie');
                                                    await adminHttp.delete(`/api/admin/eggs/${item.id}/variables/${variable.id}`);
                                                    await refresh();
                                                } catch (deleteError) {
                                                    setError(toHuman(deleteError));
                                                }
                                            }}><Glyph icon={LuTrash2} />Delete Variable</button>
                                        </div>
                                    </form>
                                );
                            })}
                        </>
                    ) : null}
                    {route.tab === 'scripts' ? (
                        <form className="admin-form-stack" onSubmit={async (event) => {
                            event.preventDefault();
                            setSubmitting(true);
                            setError(null);
                            setMessage(null);
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.patch(`/api/admin/eggs/${item.id}/scripts`, buildEggScriptPayload(scriptState));
                                setMessage('Shell script updated successfully.');
                                await refresh();
                            } catch (saveError) {
                                setError(toHuman(saveError));
                            } finally {
                                setSubmitting(false);
                            }
                        }}>
                            <Panel title="Install Script" copy="Matches the old install script editor workflow for this shell.">
                                <div className="admin-form-grid admin-form-grid--stacked">
                                    {eggScriptFields.map((field) => (
                                        <FieldEditor key={field.key} field={field} value={scriptState[field.key] ?? ''} onChange={(value) => setScriptState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                                    ))}
                                </div>
                            </Panel>
                            <SimpleTable
                                title="Copy From Options"
                                columns={['ID', 'Name']}
                                rows={(item.copy_script_options || []).map((egg: Record<string, any>) => [egg.id, egg.name])}
                                emptyLabel="No copy-from options exist for this shell."
                            />
                            <SimpleTable
                                title="Dependent Shells"
                                columns={['ID', 'Name']}
                                rows={(item.script_dependents || []).map((egg: Record<string, any>) => [egg.id, egg.name])}
                                emptyLabel="No shells currently depend on this script."
                            />
                            <div className="admin-actions-row">
                                <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />Save Script</button>
                            </div>
                        </form>
                    ) : null}
                    {route.tab === 'index' ? (
                        <form className="admin-form-stack" onSubmit={async (event) => {
                            event.preventDefault();
                            setSubmitting(true);
                            setError(null);
                            setMessage(null);
                            try {
                                await adminHttp.get('/sanctum/csrf-cookie');
                                await adminHttp.patch(`/api/admin/eggs/${item.id}`, buildEggPayload(formState));
                                setMessage('Shell updated successfully.');
                                await refresh();
                            } catch (saveError) {
                                setError(toHuman(saveError));
                            } finally {
                                setSubmitting(false);
                            }
                        }}>
                            <Panel title="Shell Details" copy="Edit the shell fields that were previously managed through the admin API.">
                                <div className="admin-form-grid admin-form-grid--stacked">
                                    {eggFields.map((field) => (
                                        <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => setFormState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                                    ))}
                                </div>
                            </Panel>
                            <div className="admin-actions-row">
                                <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />Save Shell</button>
                                <button type="button" className="admin-button admin-button--danger" onClick={async () => {
                                    if (!window.confirm('Delete this shell?')) {
                                        return;
                                    }
                                    try {
                                        await adminHttp.get('/sanctum/csrf-cookie');
                                        await adminHttp.delete(`/api/admin/eggs/${item.id}`);
                                        window.location.href = '/admin/nests';
                                    } catch (deleteError) {
                                        setError(toHuman(deleteError));
                                    }
                                }}><Glyph icon={LuTrash2} />Delete Shell</button>
                            </div>
                        </form>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

function mapEggToFormState(item: Record<string, any> | null): Record<string, any> {
    if (!item) {
        return { force_outgoing_ip: false };
    }

    return {
        nest_id: item.nest_id,
        name: item.name,
        image: item.image,
        description: item.description,
        docker_images: item.docker_images_text || '',
        startup: item.startup,
        config_from: item.config_from,
        config_stop: item.config_stop,
        config_startup: item.config_startup,
        config_logs: item.config_logs,
        config_files: item.config_files,
        force_outgoing_ip: item.force_outgoing_ip,
    };
}

function mapEggScriptToFormState(item: Record<string, any> | null): Record<string, any> {
    if (!item) {
        return { script_is_privileged: false };
    }

    return {
        copy_script_from: item.copy_script_from,
        script_is_privileged: item.script_is_privileged,
        script_entry: item.copy_script_entry ?? item.script_entry,
        script_container: item.copy_script_container ?? item.script_container,
        script_install: item.copy_script_install ?? item.script_install,
    };
}

function mapEggVariableToFormState(variable: Record<string, any>): Record<string, any> {
    return {
        name: variable.name,
        description: variable.description,
        env_variable: variable.env_variable,
        default_value: variable.default_value,
        rules: variable.rules,
        user_viewable: variable.user_viewable,
        user_editable: variable.user_editable,
    };
}

function buildEggPayload(state: Record<string, string>) {
    return {
        nest_id: Number(state.nest_id),
        name: state.name,
        image: state.image || null,
        description: state.description || null,
        docker_images: state.docker_images,
        startup: state.startup,
        config_from: state.config_from ? Number(state.config_from) : null,
        config_stop: state.config_stop || null,
        config_startup: state.config_startup || null,
        config_logs: state.config_logs || null,
        config_files: state.config_files || null,
        force_outgoing_ip: state.force_outgoing_ip === 'true',
    };
}

function buildEggScriptPayload(state: Record<string, string>) {
    return {
        copy_script_from: state.copy_script_from ? Number(state.copy_script_from) : null,
        script_is_privileged: state.script_is_privileged === 'true',
        script_entry: state.script_entry || '',
        script_container: state.script_container || '',
        script_install: state.script_install || null,
    };
}

function buildEggVariablePayload(state: Record<string, string>) {
    const options: string[] = [];
    if (state.user_viewable === 'true') {
        options.push('user_viewable');
    }
    if (state.user_editable === 'true') {
        options.push('user_editable');
    }

    return {
        name: state.name,
        description: state.description || '',
        env_variable: state.env_variable,
        default_value: state.default_value ?? '',
        rules: state.rules,
        options,
    };
}
