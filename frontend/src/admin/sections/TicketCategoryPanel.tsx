'use client';

import React, { useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { adminHttp, toHuman } from '../api';
import { Banner, Glyph, Panel, SimpleTable } from '../components/common';

export default function TicketCategoryPanel() {
    const [categories, setCategories] = useState<Record<string, any>[]>([]);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const refresh = async () => {
        const { data } = await adminHttp.get('/api/admin/tickets/meta');
        setCategories(data?.data?.categories || []);
    };

    useEffect(() => {
        refresh().catch((loadError) => setError(toHuman(loadError)));
    }, []);

    return (
        <Panel title="Ticket Categories" copy="Create, rename, or remove support categories used by the ticket system.">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {message ? <Banner tone="warning">{message}</Banner> : null}
            <div className="admin-form-grid">
                <label className="admin-field">
                    <span>New Category</span>
                    <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
                </label>
                <button
                    type="button"
                    className="admin-button admin-button--primary"
                    onClick={async () => {
                        setError(null);
                        setMessage(null);
                        try {
                            await adminHttp.get('/sanctum/csrf-cookie');
                            await adminHttp.post('/api/admin/tickets/categories', { name: draft });
                            setDraft('');
                            setMessage('Category created successfully.');
                            await refresh();
                        } catch (actionError) {
                            setError(toHuman(actionError));
                        }
                    }}
                >
                    <Glyph icon={LuPlus} />
                    Create Category
                </button>
            </div>
            <SimpleTable
                title="Categories"
                columns={['ID', 'Name', 'Actions']}
                rows={categories.map((category) => [
                    category.id,
                    category.name,
                    <div key={category.id} className="admin-actions-grid admin-actions-grid--tight">
                        <button
                            type="button"
                            className="admin-button"
                            onClick={async () => {
                                const name = window.prompt('Rename category', category.name);
                                if (!name) {
                                    return;
                                }
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    await adminHttp.patch(`/api/admin/tickets/categories/${category.id}`, { name });
                                    await refresh();
                                } catch (actionError) {
                                    setError(toHuman(actionError));
                                }
                            }}
                        >
                            Rename
                        </button>
                        <button
                            type="button"
                            className="admin-button admin-button--danger"
                            onClick={async () => {
                                if (!window.confirm('Delete this category?')) {
                                    return;
                                }
                                try {
                                    await adminHttp.get('/sanctum/csrf-cookie');
                                    await adminHttp.delete(`/api/admin/tickets/categories/${category.id}`);
                                    await refresh();
                                } catch (actionError) {
                                    setError(toHuman(actionError));
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>,
                ])}
                emptyLabel="No ticket categories are configured."
            />
        </Panel>
    );
}
