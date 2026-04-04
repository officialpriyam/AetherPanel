import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import TicketsContainer from '@/components/tickets/TicketsContainer';
import TicketViewContainer from '@/components/tickets/TicketViewContainer';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';

export default () => {
    const location = useLocation();

    return (
        <>
            <NavigationBar />
            <TransitionRouter>
                <React.Suspense fallback={<Spinner centered />}>
                    <Switch location={location}>
                        <Route path={'/tickets'} exact>
                            <TicketsContainer />
                        </Route>
                        <Route path={'/tickets/:id'} exact>
                            <TicketViewContainer />
                        </Route>
                        <Route path={'*'}>
                            <NotFound />
                        </Route>
                    </Switch>
                </React.Suspense>
            </TransitionRouter>
        </>
    );
};
