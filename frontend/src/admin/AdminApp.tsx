'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
    ADMIN_BRAND_NAME,
    FLASH_FIELD_GROUPS,
    FLASH_PAGES,
    RUNTIME_FIELD_GROUPS,
    SECTION_DESCRIPTIONS,
    SECTION_TITLES,
    SETTINGS_PAGES,
} from './config';
import { adminHttp, toHuman } from './api';
import { parseRoute } from './routes';
import type { AdminRoute, BootstrapState, ResourceSection } from './types';
import { Banner, PageHero } from './components/common';
import AdminChrome from './components/AdminChrome';
import { resourceConfigs, resourceSections } from './resources';
import PanelLoading from '@/panel/PanelLoading';
import { applySiteConfigurationTheme } from '@/panel/bootstrap';
import type { SiteSettings } from '@/state/settings';

const ConfigEditorPage = dynamic(() => import('./pages/ConfigEditorPage'), {
    loading: () => <PanelLoading ariaLabel={'Loading configuration editor'} embedded />,
});
const ResourcePage = dynamic(() => import('./pages/ResourcePage'), {
    loading: () => <PanelLoading ariaLabel={'Loading admin resource'} embedded />,
});
const OverviewPage = dynamic(() => import('./sections/OverviewPage'), {
    loading: () => <PanelLoading ariaLabel={'Loading overview'} embedded />,
});
const EggManagementPage = dynamic(() => import('./sections/EggManagementPage'), {
    loading: () => <PanelLoading ariaLabel={'Loading shell management'} embedded />,
});

export default function AdminApp() {
    const pathname = usePathname();
    const route = useMemo(() => parseRoute(pathname), [pathname]);
    const [bootstrap, setBootstrap] = useState<BootstrapState>(null);
    const [bootstrapError, setBootstrapError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        adminHttp.get('/api/bootstrap')
            .then(({ data }) => {
                if (!active) {
                    return;
                }

                setBootstrap(data?.data ?? null);
                setBootstrapError(null);
            })
            .catch((error) => {
                if (!active) {
                    return;
                }

                if (error?.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }

                setBootstrapError(toHuman(error));
            });

        return () => {
            active = false;
        };
    }, []);

    const brandName = bootstrap?.siteConfiguration?.name || ADMIN_BRAND_NAME;
    const flashConfig = bootstrap?.siteConfiguration?.flash || {};
    const logo = flashConfig.logo || flashConfig.meta_favicon || '/branding/aether-mark.png';

    useEffect(() => {
        if (bootstrap?.siteConfiguration) {
            applySiteConfigurationTheme(bootstrap.siteConfiguration as SiteSettings);
            if (typeof window !== 'undefined') {
                window.SiteConfiguration = bootstrap.siteConfiguration;
            }
        }
    }, [bootstrap]);

    return (
        <AdminChrome
            route={route}
            brandName={brandName}
            logo={logo}
            bootstrap={bootstrap}
            onLogout={async () => {
                try {
                    await adminHttp.get('/sanctum/csrf-cookie');
                    await adminHttp.post('/api/auth/logout');
                } finally {
                    window.location.href = '/auth/login';
                }
            }}
        >
                {bootstrapError ? <Banner tone='danger'>{bootstrapError}</Banner> : null}

                <PageHero
                    title={SECTION_TITLES[route.section]}
                    description={SECTION_DESCRIPTIONS[route.section]}
                    tone={route.section === 'flash' ? 'flash' : route.section === 'settings' ? 'settings' : 'default'}
                    brandName={brandName}
                    showMeta={route.section === 'overview'}
                />

                {route.section === 'overview' ? <OverviewPage brandName={brandName} username={bootstrap?.user?.username || 'Administrator'} /> : null}
                {route.section === 'settings' ? <ConfigEditorPage route={route} endpoint='/api/admin/settings/runtime' groups={RUNTIME_FIELD_GROUPS} pages={SETTINGS_PAGES} /> : null}
                {route.section === 'flash' ? (
                    <ConfigEditorPage
                        route={route}
                        endpoint='/api/admin/settings/flash'
                        groups={FLASH_FIELD_GROUPS}
                        pages={FLASH_PAGES}
                        isFlash
                        onSaved={(nextFlash) => setBootstrap((current) => current ? ({
                            ...current,
                            siteConfiguration: {
                                ...current.siteConfiguration,
                                flash: nextFlash,
                            },
                        }) : current)}
                    />
                ) : null}
                {route.section === 'nests' && route.subject === 'egg' ? <EggManagementPage route={route} /> : null}
                {resourceSections.has(route.section as ResourceSection) ? (
                    route.section === 'nests' && route.subject === 'egg'
                        ? null
                        : <ResourcePage route={route as AdminRoute & { section: ResourceSection }} config={resourceConfigs[route.section as ResourceSection]} />
                ) : null}
        </AdminChrome>
    );
}
