'use client';

import React, { lazy } from 'react';
import '@/i18n';
import { Router } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@/state';
import ProgressBar from '@/components/elements/ProgressBar';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { history } from '@/components/history';
import { setupInterceptors } from '@/api/interceptors';
import '@/assets/tailwind.css';
import Spinner from '@/components/elements/Spinner';
import { applyPanelBootstrap } from '@/panel/bootstrap';

const AuthenticationRouter = lazy(() => import('@/routers/AuthenticationRouter'));

setupInterceptors(history);

const TypedStoreProvider = StoreProvider as unknown as React.ComponentType<
    React.PropsWithChildren<{ store: typeof store }>
>;
const HistoryRouter = Router as unknown as React.ComponentType<
    React.PropsWithChildren<{ history: typeof history }>
>;

const AuthApp = () => {
    applyPanelBootstrap();

    return (
        <>
            <GlobalStylesheet />
            <TypedStoreProvider store={store}>
                <ProgressBar />
                <HistoryRouter history={history}>
                    <Spinner.Suspense>
                        <AuthenticationRouter />
                    </Spinner.Suspense>
                </HistoryRouter>
            </TypedStoreProvider>
        </>
    );
};

export default AuthApp;
