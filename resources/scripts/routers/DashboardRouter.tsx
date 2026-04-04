import React from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import DashboardServersContainer from '@/components/dashboard/DashboardServersContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import Alert from '@/components/elements/Alert';
import TransitionRouter from '@/TransitionRouter';
import SideBarIcon from '@/components/SideBarIcon';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import SideBar from '@/components/SideBar';
import routes from '@/routers/routes';

const TicketsContainer = React.lazy(() => import('@/components/tickets/TicketsContainer'));
const TicketViewContainer = React.lazy(() => import('@/components/tickets/TicketViewContainer'));

export default () => {
    const location = useLocation();
    const dashboardLayout = useStoreState((state: ApplicationStore) => state.settings.data!.flash.dashboardLayout);
    const useIconSidebar = Number(dashboardLayout) === 2;
    const ticketAddonEnabled = String(
        useStoreState((state: ApplicationStore) => state.settings.data!.flash.addon_ticket_system_enabled)
    ) === 'true';

    return (
        <>
        <div className={'min-h-screen flex h-full bg-center bg-no-repeat bg-cover bg-gray-800 flash-bg'}>
            {useIconSidebar ? <SideBarIcon /> : <SideBar />}
            <div className="w-full">
                <NavigationBar />
                <Alert />
                <TransitionRouter>
                    <React.Suspense fallback={<Spinner centered />}>
                        <Switch location={location}>
                            <Route path={'/'} exact>
                                <DashboardContainer />
                            </Route>
                            <Route path={'/dashboard/servers'} exact>
                                <DashboardServersContainer />
                            </Route>
                            {ticketAddonEnabled && (
                                <Route path={'/tickets'} exact>
                                    <TicketsContainer />
                                </Route>
                            )}
                            {ticketAddonEnabled && (
                                <Route path={'/tickets/:id'} exact>
                                    <TicketViewContainer />
                                </Route>
                            )}
                            {routes.account.map(({ path, component: Component }) => (
                                <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                    <Component />
                                </Route>
                            ))}
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </React.Suspense>
                </TransitionRouter>
            </div>
        </div>
        </>
    );
};
