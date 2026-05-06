'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import {
    LuBoxes,
    LuCircleCheck,
    LuCpu,
    LuExternalLink,
    LuGlobe,
    LuHardDrive,
    LuMapPinned,
    LuPlus,
    LuServer,
    LuSettings2,
    LuShield,
    LuSparkles,
    LuUsers,
    LuWand,
} from 'react-icons/lu';
import PanelLoading from '@/panel/PanelLoading';
import { adminHttp, toHuman } from '../api';
import { Banner, Glyph, Panel, StatusBadge } from '../components/common';
import { formatScalar, toTitleCase } from '../utils';

type StatTone = 'accent' | 'secondary' | 'neutral';
type HealthTone = 'success' | 'warning' | 'neutral';

const statMeta: Record<string, { label: string; hint: string; icon: IconType; tone: StatTone }> = {
    servers: { label: 'Total Servers', hint: 'Provisioned workloads', icon: LuServer, tone: 'accent' },
    users: { label: 'Total Users', hint: 'Accounts with access', icon: LuUsers, tone: 'neutral' },
    nodes: { label: 'Total Nodes', hint: 'Connected nodes', icon: LuMapPinned, tone: 'accent' },
    locations: { label: 'Regions', hint: 'Placement locations', icon: LuGlobe, tone: 'secondary' },
    databases: { label: 'Database Hosts', hint: 'Provisioning targets', icon: LuHardDrive, tone: 'secondary' },
    mounts: { label: 'Mounts', hint: 'Shared storage links', icon: LuBoxes, tone: 'neutral' },
};

export default function OverviewPage({ brandName, username }: { brandName: string; username: string }) {
    const [data, setData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        adminHttp.get('/api/admin/overview')
            .then(({ data: response }) => {
                if (!active) {
                    return;
                }

                setData(response?.data ?? null);
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
    }, []);

    const latestVersion = formatScalar(data?.software?.latest_panel);
    const installedVersion = formatScalar(data?.version);
    const themeVersion = formatScalar(data?.theme?.current_version);
    const sourceLabel = data?.is_git ? 'Tracked Checkout' : 'Release Archive';
    const panelState = data?.software?.up_to_date
        ? { label: 'Stable', tone: 'success' as const, summary: 'Installed panel version is aligned with the latest known release.' }
        : { label: 'Update Ready', tone: 'warning' as const, summary: `A newer panel release is available: ${latestVersion}.` };
    const themeState = data?.theme?.has_update
        ? { label: 'Theme Update', tone: 'warning' as const, summary: `A newer theme package is available beyond ${themeVersion}.` }
        : data?.theme?.checked
            ? { label: 'Synchronized', tone: 'success' as const, summary: 'Theme repository checks are responding normally.' }
            : { label: 'Unverified', tone: 'neutral' as const, summary: 'Theme repository metadata is currently unavailable.' };

    const stats = useMemo(
        () => Object.entries(data?.stats || {})
            .slice(0, 6)
            .map(([key, value]) => {
                const meta = statMeta[key] || {
                    label: toTitleCase(key),
                    hint: `${brandName} inventory`,
                    icon: LuBoxes,
                    tone: 'neutral' as StatTone,
                };

                return {
                    key,
                    value: String(value),
                    ...meta,
                };
            }),
        [brandName, data?.stats]
    );

    const healthCards: Array<{ label: string; value: string; copy: string; tone: HealthTone; icon: IconType }> = [
        {
            label: 'Admin API',
            value: 'Online',
            copy: 'Overview data is loading from the admin API successfully.',
            tone: 'success',
            icon: LuCircleCheck,
        },
        {
            label: 'Panel Release',
            value: panelState.label,
            copy: panelState.summary,
            tone: panelState.tone,
            icon: LuCpu,
        },
        {
            label: 'Theme Package',
            value: themeState.label,
            copy: themeState.summary,
            tone: themeState.tone,
            icon: LuSparkles,
        },
        {
            label: 'Session Flow',
            value: 'Ready',
            copy: 'Authenticated admin routes are active in the split frontend.',
            tone: 'success',
            icon: LuShield,
        },
        {
            label: 'Frontend Link',
            value: 'Connected',
            copy: 'The admin interface is resolving through the frontend shell.',
            tone: 'success',
            icon: LuGlobe,
        },
        {
            label: 'Source Mode',
            value: sourceLabel,
            copy: data?.is_git ? 'Running from a source checkout.' : 'Running from a packaged release build.',
            tone: 'neutral',
            icon: LuBoxes,
        },
    ];

    return (
        <div className="admin-page-stack">
            {error ? <Banner tone="danger">{error}</Banner> : null}
            {loading ? <PanelLoading ariaLabel={'Loading overview'} embedded /> : null}
            {!loading && data ? (
                <>
                    <section className="admin-overview-head">
                        <div className="admin-overview-head__title">
                            <div className="admin-overview-head__icon">
                                <Glyph icon={LuShield} />
                            </div>
                            <div className="admin-overview-head__copy">
                                <span>Operations dashboard</span>
                                <h3>Control Center</h3>
                                <p>System core, user administration, and release oversight.</p>
                            </div>
                        </div>
                        <div className="admin-overview-head__actions">
                            <Link href="/admin/flash" className="admin-button"><Glyph icon={LuWand} />Theme Studio</Link>
                            <Link href="/admin/settings" className="admin-button"><Glyph icon={LuSettings2} />Runtime Settings</Link>
                            <Link href="/admin/servers/new" className="admin-button admin-button--primary"><Glyph icon={LuPlus} />Create Server</Link>
                        </div>
                    </section>

                    <section className="admin-overview-banner">
                        <div className="admin-overview-banner__copy">
                            <div className="admin-overview-banner__pill">Administrative session active</div>
                            <h3>Welcome back, {username}</h3>
                            <p>{brandName} is ready for provisioning changes, user management, and runtime maintenance.</p>
                            <div className="admin-actions-grid admin-actions-grid--tight">
                                <Link href="/admin/servers" className="admin-button admin-button--primary"><Glyph icon={LuServer} />Manage Servers</Link>
                                <Link href="/admin/users" className="admin-button"><Glyph icon={LuUsers} />Manage Users</Link>
                                <Link href="/admin/api" className="admin-button"><Glyph icon={LuShield} />API Access</Link>
                            </div>
                        </div>
                        <div className="admin-overview-banner__meta">
                            <div className="admin-inline-metric">
                                <span>Installed Build</span>
                                <strong>{installedVersion}</strong>
                            </div>
                            <div className="admin-inline-metric">
                                <span>Release State</span>
                                <strong>{panelState.label}</strong>
                            </div>
                            <div className="admin-inline-metric">
                                <span>Theme State</span>
                                <strong>{themeState.label}</strong>
                            </div>
                        </div>
                    </section>

                    <div className="admin-stats-grid admin-stats-grid--compact">
                        {stats.map((stat) => (
                            <article key={stat.key} className={`admin-stat-card admin-stat-card--${stat.tone}`}>
                                <div className="admin-stat-card__icon">
                                    <Glyph icon={stat.icon} />
                                </div>
                                <div className="admin-stat-card__copy">
                                    <span>{stat.label}</span>
                                    <strong>{stat.value}</strong>
                                    <small>{stat.hint}</small>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="admin-split-grid">
                        <Panel title="System Health" copy="Core admin and release signals for the current control plane.">
                            <div className="admin-health-grid">
                                {healthCards.map((check) => (
                                    <article key={check.label} className="admin-health-card">
                                        <div className="admin-health-card__header">
                                            <div className="admin-health-card__icon">
                                                <Glyph icon={check.icon} />
                                            </div>
                                            <StatusBadge tone={check.tone}>{check.value}</StatusBadge>
                                        </div>
                                        <strong>{check.label}</strong>
                                        <p>{check.copy}</p>
                                    </article>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="System Version" copy="Panel and theme release posture with current installation details.">
                            <div className="admin-detail-grid">
                                <div className="admin-detail-grid__item"><span>Installed Panel</span><strong>{installedVersion}</strong></div>
                                <div className="admin-detail-grid__item"><span>Latest Panel</span><strong>{latestVersion}</strong></div>
                                <div className="admin-detail-grid__item"><span>Installed Theme</span><strong>{themeVersion}</strong></div>
                                <div className="admin-detail-grid__item"><span>Source Channel</span><strong>{sourceLabel}</strong></div>
                            </div>
                            <div className={`admin-highlight-callout admin-highlight-callout--${panelState.tone}`}>
                                <div>
                                    <span>{panelState.tone === 'success' ? 'Release channel stable' : 'Update available'}</span>
                                    <strong>{panelState.tone === 'success' ? installedVersion : latestVersion}</strong>
                                    <p>{panelState.summary}</p>
                                </div>
                                <StatusBadge tone={panelState.tone}>{panelState.label}</StatusBadge>
                            </div>
                            <div className={`admin-highlight-callout admin-highlight-callout--${themeState.tone}`}>
                                <div>
                                    <span>Theme package</span>
                                    <strong>{themeState.label}</strong>
                                    <p>{themeState.summary}</p>
                                </div>
                                <StatusBadge tone={themeState.tone}>{themeState.label}</StatusBadge>
                            </div>
                            {data?.theme?.repository ? <a className="admin-inline-link" href={data.theme.repository} target="_blank" rel="noreferrer">Open Repository <Glyph icon={LuExternalLink} /></a> : null}
                        </Panel>
                    </div>
                </>
            ) : null}
        </div>
    );
}
