'use client';

import React, { useEffect, useState } from 'react';
import { LuSave } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import { Banner, Glyph, Panel } from '../components/common';

export default function TicketActionPanels({ item, refs, refresh }: { item: Record<string, any>; refs: Record<string, any>; refresh: () => Promise<void> }) {
    const [status, setStatus] = useState(String(item.ticket?.status_id ?? 0));
    const [reply, setReply] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setStatus(String(item.ticket?.status_id ?? 0));
    }, [item.ticket?.status_id]);

    return (
        <>
            {error ? <Banner tone="danger">{error}</Banner> : null}
            <div className="admin-split-grid">
                <Panel title="Update Status" copy="Change the ticket status using the same workflow as the legacy admin page.">
                    <form className="admin-form-grid" onSubmit={async (event) => {
                        event.preventDefault();
                        setError(null);
                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.patch(`/api/admin/tickets/${item.ticket.id}/status`, { status: Number(status) });
                            await refresh();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        }
                    }}>
                        <label className="admin-field">
                            <span>Status</span>
                            <select value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
                                {(refs.statuses || []).map((entry: Record<string, any>, index: number) => (
                                    <option key={index} value={index}>{entry.name}</option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="admin-button admin-button--primary"><Glyph icon={LuSave} />Save Status</button>
                    </form>
                </Panel>
                <Panel title="Reply" copy="Send an administrative reply to this support ticket.">
                    <form className="admin-form-grid" onSubmit={async (event) => {
                        event.preventDefault();
                        setError(null);
                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.post(`/api/admin/tickets/${item.ticket.id}/reply`, { message: reply });
                            setReply('');
                            await refresh();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        }
                    }}>
                        <label className="admin-field"><span>Message</span><textarea rows={6} value={reply} onChange={(event) => setReply(event.currentTarget.value)} /></label>
                        <button type="submit" className="admin-button admin-button--primary"><Glyph icon={LuSave} />Send Reply</button>
                    </form>
                </Panel>
            </div>
        </>
    );
}
