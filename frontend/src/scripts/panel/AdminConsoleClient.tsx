'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import http, { httpErrorToHuman } from '@/api/http';
import PanelLoading from './PanelLoading';

type RouteConfig = {
    title: string;
    endpoint: string;
    editable?: boolean;
    summary: string;
};

const navItems = [
    ['overview', 'Overview'],
    ['settings', 'Runtime'],
    ['flash', 'Flash Theme'],
    ['users', 'Users'],
    ['nodes', 'Nodes'],
    ['locations', 'Locations'],
    ['servers', 'Servers'],
    ['nests', 'Nests'],
    ['mounts', 'Mounts'],
    ['tickets', 'Tickets'],
    ['databases', 'Database Hosts'],
    ['api', 'Application API'],
] as const;

const applicationSections = new Set(['users', 'nodes', 'locations', 'servers', 'nests']);

const resolveRoute = (pathname: string): RouteConfig => {
    const parts = pathname.split('/').filter(Boolean).slice(1);
    const [section = 'overview', action, identifier] = parts;

    if (section === 'overview') {
        return {
            title: 'Overview',
            endpoint: '/api/admin/overview',
            summary: 'High-level platform counters and backend version data.',
        };
    }

    if (section === 'settings') {
        return {
            title: 'Runtime Config',
            endpoint: '/api/admin/settings/runtime',
            editable: true,
            summary: action ? `Runtime settings view: ${action}.` : 'Editable backend runtime configuration sourced from config.php.',
        };
    }

    if (section === 'flash') {
        return {
            title: 'Flash Theme',
            endpoint: '/api/admin/settings/flash',
            editable: true,
            summary: 'Editable Flash theme and branding settings stored in the backend.',
        };
    }

    if (applicationSections.has(section)) {
        return {
            title: section.charAt(0).toUpperCase() + section.slice(1),
            endpoint: action === 'view' && identifier ? `/api/application/${section}/${identifier}` : `/api/application/${section}`,
            summary: action === 'view' && identifier
                ? `Detail view for ${section.slice(0, -1)} #${identifier}.`
                : `List view for ${section}.`,
        };
    }

    const customRoutes: Record<string, RouteConfig> = {
        mounts: {
            title: 'Mounts',
            endpoint: action === 'view' && identifier ? `/api/admin/mounts/${identifier}` : '/api/admin/mounts',
            summary: 'Mount relationships and usage across eggs, nodes, and servers.',
        },
        tickets: {
            title: 'Tickets',
            endpoint: action === 'view' && identifier ? `/api/admin/tickets/${identifier}` : '/api/admin/tickets',
            summary: 'Support ticket queue and detailed ticket history.',
        },
        databases: {
            title: 'Database Hosts',
            endpoint: action === 'view' && identifier ? `/api/admin/database-hosts/${identifier}` : '/api/admin/database-hosts',
            summary: 'Configured database hosts and their attached databases.',
        },
        api: {
            title: 'Application API',
            endpoint: action === 'view' && identifier ? `/api/admin/application-api/${identifier}` : '/api/admin/application-api',
            summary: 'Application API keys currently provisioned for the panel.',
        },
    };

    return customRoutes[section] ?? {
        title: 'Overview',
        endpoint: '/api/admin/overview',
        summary: 'Fallback admin overview for unmatched routes.',
    };
};

const normalizePayload = (input: any): any => {
    if (input?.object === 'list' && Array.isArray(input.data)) {
        return input.data.map((entry: any) => entry?.attributes ?? entry);
    }

    if (input?.attributes && input?.object) {
        return input.attributes;
    }

    return input;
};

const renderScalar = (value: unknown): string => {
    if (value === null || value === undefined) {
        return 'null';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
};

const toDisplayEntries = (value: unknown): Array<[string, unknown]> =>
    value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>) : [];

export default function AdminConsoleClient() {
    const pathname = usePathname();
    const route = useMemo(() => resolveRoute(pathname), [pathname]);
    const [payload, setPayload] = useState<any>(null);
    const [editorValue, setEditorValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        http.get(route.endpoint)
            .then(({ data }) => {
                if (!active) {
                    return;
                }

                const nextPayload = normalizePayload(data?.data ?? data);
                setPayload(nextPayload);

                if (route.editable) {
                    setEditorValue(JSON.stringify(nextPayload, null, 2));
                }
            })
            .catch((err) => {
                if (!active) {
                    return;
                }

                if (err?.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }

                setError(httpErrorToHuman(err));
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [route]);

    const onSave = async () => {
        if (!route.editable) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const parsed = JSON.parse(editorValue);
            const body = route.endpoint.endsWith('/flash') ? { settings: parsed } : parsed;

            await http.get('/sanctum/csrf-cookie');
            const { data } = await http.patch(route.endpoint, body);
            const nextPayload = normalizePayload(data?.data ?? data);

            setPayload(nextPayload);
            setEditorValue(JSON.stringify(nextPayload, null, 2));
        } catch (err) {
            setError(httpErrorToHuman(err));
        } finally {
            setSaving(false);
        }
    };

    const isCollection = Array.isArray(payload);
    const collectionKeys = isCollection && payload.length > 0
        ? Array.from(
            payload.reduce((keys: Set<string>, item: Record<string, unknown>) => {
                Object.keys(item || {}).forEach((key) => keys.add(key));
                return keys;
            }, new Set<string>())
        ).slice(0, 6) as string[]
        : [];

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                background:
                    'radial-gradient(circle at top left, rgba(30, 41, 59, 0.45), transparent 28%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
            }}
        >
            <aside
                style={{
                    padding: '28px 22px',
                    borderRight: '1px solid rgba(148, 163, 184, 0.12)',
                    background: 'rgba(2, 6, 23, 0.84)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
                        Admin Panel
                    </div>
                    <h1 style={{ margin: '8px 0 0', fontSize: '28px' }}>TSX Console</h1>
                </div>
                <nav style={{ display: 'grid', gap: '8px' }}>
                    {navItems.map(([key, label]) => {
                        const active = pathname === `/admin/${key}` || (key === 'overview' && pathname === '/admin') || pathname.startsWith(`/admin/${key}/`);
                        return (
                            <Link
                                key={key}
                                href={key === 'overview' ? '/admin' : `/admin/${key}`}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    textDecoration: 'none',
                                    color: active ? '#f8fafc' : '#cbd5e1',
                                    background: active ? 'rgba(37, 99, 235, 0.22)' : 'transparent',
                                    border: '1px solid rgba(148, 163, 184, 0.12)',
                                }}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <section style={{ padding: '32px' }}>
                <header style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
                        {pathname}
                    </div>
                    <h2 style={{ margin: '10px 0 8px', fontSize: '34px' }}>{route.title}</h2>
                    <p style={{ margin: 0, color: '#94a3b8', maxWidth: '720px' }}>{route.summary}</p>
                </header>

                {error && (
                    <p
                        style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            color: '#fecaca',
                            background: 'rgba(127, 29, 29, 0.45)',
                            border: '1px solid rgba(248, 113, 113, 0.24)',
                        }}
                    >
                        {error}
                    </p>
                )}

                {loading ? (
                    <PanelLoading ariaLabel={'Loading admin data'} embedded />
                ) : null}

                {!loading && route.editable ? (
                    <section style={{ display: 'grid', gap: '14px' }}>
                        <textarea
                            value={editorValue}
                            onChange={(event) => setEditorValue(event.currentTarget.value)}
                            style={{
                                minHeight: '540px',
                                width: '100%',
                                borderRadius: '18px',
                                border: '1px solid rgba(148, 163, 184, 0.16)',
                                background: 'rgba(15, 23, 42, 0.88)',
                                color: '#e2e8f0',
                                padding: '20px',
                                fontFamily: '"IBM Plex Mono", monospace',
                                fontSize: '14px',
                                lineHeight: 1.6,
                            }}
                        />
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            style={{
                                width: 'fit-content',
                                borderRadius: '999px',
                                border: '1px solid rgba(147, 197, 253, 0.35)',
                                background: '#2563eb',
                                color: '#eff6ff',
                                padding: '12px 18px',
                                fontWeight: 700,
                                cursor: saving ? 'wait' : 'pointer',
                            }}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </section>
                ) : null}

                {!loading && !route.editable && route.endpoint === '/api/admin/overview' && payload?.stats ? (
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        {toDisplayEntries(payload.stats).map(([key, value]) => (
                            <article
                                key={key}
                                style={{
                                    padding: '20px',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(148, 163, 184, 0.16)',
                                    background: 'rgba(15, 23, 42, 0.88)',
                                }}
                            >
                                <div style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px' }}>
                                    {key.replace(/_/g, ' ')}
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '34px', fontWeight: 700 }}>{renderScalar(value)}</div>
                            </article>
                        ))}
                    </section>
                ) : null}

                {!loading && !route.editable && isCollection ? (
                    <section
                        style={{
                            borderRadius: '18px',
                            border: '1px solid rgba(148, 163, 184, 0.16)',
                            background: 'rgba(15, 23, 42, 0.88)',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                                        {collectionKeys.map((key) => (
                                            <th key={key} style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payload.map((item: Record<string, unknown>, index: number) => (
                                        <tr key={index} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
                                            {collectionKeys.map((key) => (
                                                <td key={key} style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '14px' }}>
                                                    {renderScalar(item?.[key])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : null}

                {!loading && !route.editable && !isCollection && payload && route.endpoint !== '/api/admin/overview' ? (
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        {toDisplayEntries(payload).map(([key, value]) => (
                            <article
                                key={key}
                                style={{
                                    padding: '18px',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(148, 163, 184, 0.16)',
                                    background: 'rgba(15, 23, 42, 0.88)',
                                }}
                            >
                                <div style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px' }}>
                                    {key}
                                </div>
                                <pre
                                    style={{
                                        margin: '12px 0 0',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontFamily: '"IBM Plex Mono", monospace',
                                        fontSize: '13px',
                                        lineHeight: 1.5,
                                        color: '#e2e8f0',
                                    }}
                                >
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : renderScalar(value)}
                                </pre>
                            </article>
                        ))}
                    </section>
                ) : null}
            </section>
        </main>
    );
}
