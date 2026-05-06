'use client';

import React, { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import { Banner, Glyph, Panel } from '../components/common';

export default function MountAttachmentPanels({ item, refs, refresh }: { item: Record<string, any>; refs: Record<string, any>; refresh: () => Promise<void> }) {
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [state, setState] = useState({ eggs: [] as string[], nodes: [] as string[] });

    const updateSelection = (key: 'eggs' | 'nodes', event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValues = Array.from(event.currentTarget.selectedOptions, (option) => option.value);

        setState((current) => ({
            ...current,
            [key]: selectedValues,
        }));
    };

    return (
        <>
            {error ? <Banner tone="danger">{error}</Banner> : null}
            <div className="admin-split-grid">
                <Panel title="Attach Shells" copy="Choose one or more shells to attach to this mount.">
                    <form className="admin-form-grid" onSubmit={async (event) => {
                        event.preventDefault();
                        setBusy('attach-eggs');
                        setError(null);
                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.post(`/api/admin/mounts/${item.id}/eggs`, {
                                eggs: state.eggs.map((value) => Number(value)).filter(Boolean),
                            });
                            setState((current) => ({ ...current, eggs: [] }));
                            await refresh();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        } finally {
                            setBusy(null);
                        }
                    }}>
                        <label className="admin-field">
                            <span>Shells</span>
                            <select multiple value={state.eggs} onChange={(event) => updateSelection('eggs', event)} size={10}>
                                {(refs.eggs || []).map((egg: Record<string, any>) => (
                                    <option key={egg.id} value={String(egg.id)}>
                                        {`#${egg.id} - ${egg.name}${egg.nest_name ? ` (${egg.nest_name})` : ''}`}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'attach-eggs'}><Glyph icon={LuPlus} />{busy === 'attach-eggs' ? 'Attaching...' : 'Attach Shells'}</button>
                    </form>
                </Panel>
                <Panel title="Attach Nodes" copy="Choose one or more nodes to attach to this mount.">
                    <form className="admin-form-grid" onSubmit={async (event) => {
                        event.preventDefault();
                        setBusy('attach-nodes');
                        setError(null);
                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.post(`/api/admin/mounts/${item.id}/nodes`, {
                                nodes: state.nodes.map((value) => Number(value)).filter(Boolean),
                            });
                            setState((current) => ({ ...current, nodes: [] }));
                            await refresh();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        } finally {
                            setBusy(null);
                        }
                    }}>
                        <label className="admin-field">
                            <span>Nodes</span>
                            <select multiple value={state.nodes} onChange={(event) => updateSelection('nodes', event)} size={10}>
                                {(refs.nodes || []).map((node: Record<string, any>) => (
                                    <option key={node.id} value={String(node.id)}>
                                        {`#${node.id} - ${node.name}`}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="admin-button admin-button--primary" disabled={busy === 'attach-nodes'}><Glyph icon={LuPlus} />{busy === 'attach-nodes' ? 'Attaching...' : 'Attach Nodes'}</button>
                    </form>
                </Panel>
            </div>
        </>
    );
}
