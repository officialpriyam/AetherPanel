'use client';

import React, { useEffect, useState } from 'react';
import { getFrontendAccessHeaders } from '@/lib/backendAccess';
import PanelLoading from './PanelLoading';

type BootstrapPayload = {
    data: {
        siteConfiguration: Record<string, unknown>;
        user: Record<string, unknown> | null;
    };
};

declare global {
    interface Window {
        PterodactylUser?: Record<string, unknown>;
        SiteConfiguration?: Record<string, unknown>;
    }
}

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export default function LegacyPanelClient() {
    const [AppComponent, setAppComponent] = useState<React.ComponentType | null>(null);
    const [state, setState] = useState<{ ready: boolean; error: string | null }>({
        ready: false,
        error: null,
    });

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const bootstrapUrl = `${apiUrl}/api/bootstrap`;
        const appModule = window.location.pathname.startsWith('/auth')
            ? import('@/components/AuthApp')
            : import('@/components/App');

        Promise.all([
            appModule.then((module) => module.default),
            fetch(bootstrapUrl, {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    ...getFrontendAccessHeaders(),
                },
                signal: controller.signal,
            }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Bootstrap request failed with status ${response.status}.`);
                }

                return (await response.json()) as BootstrapPayload;
            }),
        ])
            .then(([App, payload]) => {
                if (!active) {
                    return;
                }

                setAppComponent(() => App);
                window.PterodactylUser = payload.data.user ?? undefined;
                window.SiteConfiguration = payload.data.siteConfiguration;
                setState({ ready: true, error: null });
                window.dispatchEvent(new Event('panel:ready'));
            })
            .catch((error: Error) => {
                if (!active || error.name === 'AbortError') {
                    return;
                }

                setState({ ready: false, error: `${error.message} (${bootstrapUrl})` });
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    if (state.error) {
        return (
            <main style={{ padding: '48px' }}>
                <h1>Panel bootstrap failed</h1>
                <p>{state.error}</p>
            </main>
        );
    }

    if (!state.ready) {
        return <PanelLoading />;
    }

    if (!AppComponent) {
        return <PanelLoading ariaLabel={'Preparing application shell'} />;
    }

    return <AppComponent />;
}
