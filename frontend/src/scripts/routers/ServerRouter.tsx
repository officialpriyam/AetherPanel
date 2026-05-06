import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ApplicationStore } from '@/state';
import Alert from '@/components/elements/Alert';
import { ServerContext } from '@/state/server';
import SubNavigation from '@/components/Navigation';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import SideBar from '@/components/SideBar';
import SideBarIcon from '@/components/SideBarIcon';
import LowResourcesAlert from '@/components/server/LowResourcesAlert';
import PanelSounds from '@/components/server/PanelSounds';
import InstallListener from '@/components/server/InstallListener';
import NodeAlert from '@/components/server/NodeAlert';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import { Navigation, ComponentLoader } from '@/routers/RouterElements';
import FloatingBar from '@/components/server/FloatingBar';
import PteroGPTFloatingAssistant from '@/components/server/pterogpt/PteroGPTFloatingAssistant';

/*
        ██╗██╗  ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗  ██╗██╗
        ██║██║  ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║  ██║██║
        ██║██║  ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║  ██║██║
        ╚═╝╚═╝  ░░████╔═████║░██╔══██║██╔══██╗██║╚████║  ╚═╝╚═╝
        ██╗██╗  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║  ██╗██╗
        ╚═╝╚═╝  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝  ╚═╝╚═╝


        Read this before doing addon modifications

        Flash Theme has already handled many panel 
        modifications for you, so there's no need for 
        any changes in the "ServerRouter.tsx" file.
*/

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const layout = useStoreState((state: ApplicationStore) => state.settings.data!.flash.layout);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <div className={'min-h-screen h-full bg-center bg-no-repeat bg-cover'}>
                <PanelSounds />
                {!uuid || !id ? (
                    error ? (
                        <ServerError message={error} />
                    ) : (
                        <Spinner size={'large'} centered />
                    )
                ) : (
                    <>
                        {/* Floating Bar Layouts - Moved outside flex to ensure perfect viewport centering */}
                        {layout == 5 && <FloatingBar position={'top'} />}
                        {layout == 6 && <FloatingBar position={'bottom'} />}

                        <div className="flex">

                            {(layout == 1 || layout == 4) &&
                            <SideBarIcon>
                                <Navigation />
                            </SideBarIcon>
                            }

                            <div className={`w-full ${layout == 5 ? 'pt-20' : layout == 6 ? 'pb-24' : ''}`}>
                            {layout != 5 && layout != 6 &&
                                <NavigationBar>
                                    <Navigation />
                                </NavigationBar>
                            }
                            <InstallListener />
                            <TransferListener />
                            <WebsocketHandler />
                            {inConflictState && (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                                <ConflictStateRenderer />
                            ) : (
                                <ErrorBoundary>
                                    <div className={'lg:block hidden'}>
                                        {(layout == 1 || layout == 4 || layout == 5 || layout == 6) &&
                                            <SubNavigation />
                                        }
                                    </div>
                                    <div className={'lg:hidden block'}>
                                        <SubNavigation />
                                    </div>
                                    <LowResourcesAlert />
                                    <NodeAlert />
                                    <ComponentLoader />
                                    <PteroGPTFloatingAssistant />
                                </ErrorBoundary>
                            )}
                        </div>
                    </div>
                    </>
                )}
            </div>
        </React.Fragment>
    );
};
