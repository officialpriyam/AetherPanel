import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
import { useStoreState } from '@/state/hooks';

type Props = React.PropsWithChildren<Omit<RouteProps, 'render'>>;

const AuthenticatedRoute: React.FC<Props> = ({ children, ...props }) => {
    const isAuthenticated = useStoreState((state) => !!state.user.data?.uuid);

    return (
        <Route
            {...props}
            render={({ location }) =>
                isAuthenticated ? <>{children}</> : <Redirect to={{ pathname: '/auth/login', state: { from: location } }} />
            }
        />
    );
};

export default AuthenticatedRoute;
