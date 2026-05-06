'use client';

import React, { lazy } from 'react';
import '@/i18n';
import { Route, Router, Switch } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@/state';
import ProgressBar from '@/components/elements/ProgressBar';
import { NotFound } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { history } from '@/components/history';
import { setupInterceptors } from '@/api/interceptors';
import AuthenticatedRoute from '@/components/elements/AuthenticatedRoute';
import { ServerContext } from '@/state/server';
import '@/assets/tailwind.css';
import Spinner from '@/components/elements/Spinner';
import { applyPanelBootstrap } from '@/panel/bootstrap';

const DashboardRouter = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import(/* webpackChunkName: "server" */ '@/routers/ServerRouter'));
const AuthenticationRouter = lazy(() => import(/* webpackChunkName: "auth" */ '@/routers/AuthenticationRouter'));

setupInterceptors(history);

const TypedStoreProvider = StoreProvider as unknown as React.ComponentType<
    React.PropsWithChildren<{ store: typeof store }>
>;
const HistoryRouter = Router as unknown as React.ComponentType<
    React.PropsWithChildren<{ history: typeof history }>
>;
const ServerProvider = ServerContext.Provider as unknown as React.ComponentType<React.PropsWithChildren<object>>;

const App = () => {
    applyPanelBootstrap();

    return (
        <>
            <GlobalStylesheet />
            <TypedStoreProvider store={store}>
                <ProgressBar />
                <div css={tw`mx-auto w-auto`}>
                    <HistoryRouter history={history}>
                        <Switch>
                            <Route path={'/auth'}>
                                <Spinner.Suspense>
                                    <AuthenticationRouter />
                                </Spinner.Suspense>
                            </Route>
                            <AuthenticatedRoute path={'/server/:id'}>
                                <Spinner.Suspense>
                                    <ServerProvider>
                                        <ServerRouter />
                                    </ServerProvider>
                                </Spinner.Suspense>
                            </AuthenticatedRoute>
                            <AuthenticatedRoute path={'/'}>
                                <Spinner.Suspense>
                                    <DashboardRouter />
                                </Spinner.Suspense>
                            </AuthenticatedRoute>
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </HistoryRouter>
                </div>
            </TypedStoreProvider>
        </>
    );
};

export default App;
