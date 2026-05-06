'use client';

import React, { useEffect, useState } from 'react';
import { LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { adminHttp, toHuman } from '../api';
import type { AdminRoute } from '../types';
import { buildInitialFieldState, formatScalar, getRelationItems } from '../utils';
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
                setFormState(buildInitialFieldState(eggFields, { force_outgoing_ip: false }));
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

    return (
        <div className="admin-page-stack">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {message ? <Banner tone="warning">{message}</Banner> : null}
            {loading ? <PanelLoading ariaLabel={'Loading egg details'} embedded /> : null}
            {!loading && route.view === 'new' ? (
                <form className="admin-form-stack" onSubmit={async (event) => {
                    event.preventDefault();
                    setSubmitting(true);
                    setError(null);
                    setMessage(null);
                    try {
                        await adminHttp.get('/sanctum/csrf-cookie');
                        await adminHttp.post('/api/admin/eggs', buildEggPayload(formState));
                        setMessage('Egg created successfully.');
                        setFormState(buildInitialFieldState(eggFields, { force_outgoing_ip: false }));
                    } catch (saveError) {
                        setError(toHuman(saveError));
                    } finally {
                        setSubmitting(false);
                    }
                }}>
                    <Panel title="Create Egg" copy="Build a new egg from the legacy admin fields, now stored through the API.">
                        <div className="admin-form-grid admin-form-grid--stacked">
                            {eggFields.map((field) => (
                                <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => setFormState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                            ))}
                        </div>
                    </Panel>
                    <div className="admin-actions-row">
                        <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />{submitting ? 'Creating...' : 'Create Egg'}</button>
                    </div>
                </form>
            ) : null}
            {!loading && route.view === 'detail' && item ? (
                <>
                    <SubnavTabs baseHref={`/admin/nests/egg/${route.id}`} items={eggDetailTabs} activeId={route.tab} />
                    <DetailList
                        title="Egg Summary"
                        items={[
                            ['ID', String(item.id ?? '-')],
                            ['Nest', formatScalar(item.nest?.name ?? item.nest_id)],
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
                                <Panel title="Create Variable" copy="Add a new environment variable to this egg.">
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
                                setMessage('Egg script updated successfully.');
                                await refresh();
                            } catch (saveError) {
                                setError(toHuman(saveError));
                            } finally {
                                setSubmitting(false);
                            }
                        }}>
                            <Panel title="Install Script" copy="Matches the old script editor workflow for this egg.">
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
                                emptyLabel="No copy-from options exist for this egg."
                            />
                            <SimpleTable
                                title="Dependent Eggs"
                                columns={['ID', 'Name']}
                                rows={(item.script_dependents || []).map((egg: Record<string, any>) => [egg.id, egg.name])}
                                emptyLabel="No eggs currently depend on this script."
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
                                setMessage('Egg updated successfully.');
                                await refresh();
                            } catch (saveError) {
                                setError(toHuman(saveError));
                            } finally {
                                setSubmitting(false);
                            }
                        }}>
                            <Panel title="Egg Details" copy="Edit the egg fields that were previously managed through Blade.">
                                <div className="admin-form-grid admin-form-grid--stacked">
                                    {eggFields.map((field) => (
                                        <FieldEditor key={field.key} field={field} value={formState[field.key] ?? ''} onChange={(value) => setFormState((current) => ({ ...current, [field.key]: value }))} refs={refs} />
                                    ))}
                                </div>
                            </Panel>
                            <div className="admin-actions-row">
                                <button type="submit" className="admin-button admin-button--primary" disabled={submitting}><Glyph icon={LuSave} />Save Egg</button>
                                <button type="button" className="admin-button admin-button--danger" onClick={async () => {
                                    if (!window.confirm('Delete this egg?')) {
                                        return;
                                    }
                                    try {
                                        await adminHttp.get('/sanctum/csrf-cookie');
                                        await adminHttp.delete(`/api/admin/eggs/${item.id}`);
                                        window.location.href = '/admin/nests';
                                    } catch (deleteError) {
                                        setError(toHuman(deleteError));
                                    }
                                }}><Glyph icon={LuTrash2} />Delete Egg</button>
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
