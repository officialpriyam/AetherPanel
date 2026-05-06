'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { LuSave } from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { applyFlashColorSchema, getFlashColorSchema } from '@/panel/flashColorSchemas';
import type { FormFieldGroup } from '../config';
import type { AdminRoute } from '../types';
import { adminHttp, toHuman } from '../api';
import { buildInitialFieldState, serializeFieldState } from '../utils';
import { Banner, FieldEditor, Glyph, Panel, SubnavTabs } from '../components/common';

function ConfigEditorPage({
    route,
    endpoint,
    groups,
    pages,
    isFlash,
    onSaved,
}: {
    route: AdminRoute;
    endpoint: string;
    groups: FormFieldGroup[];
    pages: { id: string; label: string; description: string }[];
    isFlash?: boolean;
    onSaved?: (data: Record<string, any>) => void;
}) {
    const [state, setState] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const activePage = pages.find((page) => page.id === route.tab) ?? pages[0];
    const activeGroups = groups.filter((group) => group.page === activePage.id);
    const activeFields = activeGroups.flatMap((group) => group.fields);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        setMessage(null);

        adminHttp.get(endpoint)
            .then(({ data: response }) => {
                if (!active) {
                    return;
                }

                const payload = response?.data ?? {};
                const initialState = buildInitialFieldState(activeFields, payload);
                setState(isFlash && route.tab === 'colors'
                    ? applyFlashColorSchema(initialState, payload.colorSchemaPreset || 'custom', false)
                    : initialState);
            })
            .catch((loadError) => {
                if (!active) {
                    return;
                }

                setError(toHuman(loadError));
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [endpoint, route.tab]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            await adminHttp.get('/sanctum/csrf-cookie');
            const payload = serializeFieldState(activeFields, state);
            const requestBody = isFlash ? { settings: payload } : payload;
            const { data: response } = await adminHttp.patch(endpoint, requestBody);
            const nextData = response?.data ?? payload;
            const nextState = buildInitialFieldState(activeFields, nextData);
            setState(isFlash && route.tab === 'colors'
                ? applyFlashColorSchema(nextState, nextData.colorSchemaPreset || payload.colorSchemaPreset || 'custom', false)
                : nextState);
            onSaved?.(nextData);
            setMessage('Changes saved successfully.');
        } catch (saveError) {
            setError(toHuman(saveError));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page-stack">
            <SubnavTabs baseHref={`/admin/${route.section}`} items={pages} activeId={activePage.id} />
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {message ? <Banner tone="warning">{message}</Banner> : null}
            <form className="admin-form-stack" onSubmit={onSubmit}>
                {loading ? <PanelLoading ariaLabel={'Loading configuration'} embedded /> : null}
                {!loading && activeGroups.map((group) => (
                    <Panel key={group.id} title={group.title} copy={group.description}>
                        <div className="admin-form-grid">
                            {group.fields.map((field) => (
                                <FieldEditor
                                    key={field.key}
                                    field={field}
                                    value={state[field.key] ?? ''}
                                    onChange={(value) => {
                                        if (isFlash && route.tab === 'colors' && field.key === 'colorSchemaPreset') {
                                            const schema = getFlashColorSchema(value);
                                            setState((current) => applyFlashColorSchema(current, value, true));
                                            setError(null);
                                            setMessage(schema.id === 'custom'
                                                ? 'Custom palette selected. Save changes after editing the color tokens you want.'
                                                : `${schema.label} palette applied. Save changes to publish it site-wide.`);
                                            return;
                                        }

                                        setState((current) => ({ ...current, [field.key]: value }));
                                    }}
                                />
                            ))}
                        </div>
                    </Panel>
                ))}
                {!loading ? (
                    <div className="admin-actions-row">
                        <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
                            <Glyph icon={LuSave} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : null}
            </form>
        </div>
    );
}

export default ConfigEditorPage;
