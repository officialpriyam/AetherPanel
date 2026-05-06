import React, { memo } from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import ServerSideCard from '@/components/server/console/ServerSideCard';
import ServerHeader from '@/components/server/console/ServerHeader';
import { TerminalIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ConsoleNotice: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className={'mb-4 rounded-box border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100'}>
        {children}
    </div>
);

const ServerConsoleContainer = () => {
    const { t } = useTranslation('flash/server/console')
    const statsCards = useStoreState((state: ApplicationStore) => state.settings.data!.flash.statsCards);
    const graphs = useStoreState((state: ApplicationStore) => state.settings.data!.flash.graphs);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);

    // Modern Dashboard mode (statsCards == 4)
    const isModernDashboard = statsCards == 4;

    if (isModernDashboard) {
        return (
            <ServerContentBlock title={t('console')} icon={TerminalIcon}>
                {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                    <ConsoleNotice>
                        {isNodeUnderMaintenance
                            ? t('node-under-maintenance')
                            : isInstalling
                            ? t('running-installation-process')
                            : t('being-transferred')}
                    </ConsoleNotice>
                )}

                {/* Server Header with name, badges, power buttons */}
                <ServerHeader />

                {/* Console (2/3) + Side Cards (1/3) */}
                <div className={'lg:grid lg:grid-cols-3 flex flex-col gap-4'}>
                    <div className={'lg:col-span-2'}>
                        <Spinner.Suspense>
                            <Console />
                        </Spinner.Suspense>
                    </div>
                    <div>
                        <ServerSideCard />
                    </div>
                </div>

                {/* 4-column graphs at the bottom */}
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'}>
                    <StatGraphs />
                </div>

                <Features enabled={eggFeatures} />
            </ServerContentBlock>
        );
    }

    // Standard layouts
    return (
        <ServerContentBlock title={t('console')} icon={TerminalIcon}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <ConsoleNotice>
                    {isNodeUnderMaintenance
                        ? t('node-under-maintenance')
                        : isInstalling
                        ? t('running-installation-process')
                        : t('being-transferred')}
                </ConsoleNotice>
            )}

            {/* Stats cards above console (option 2) */}
            {statsCards == 2 &&
            <div className={'mb-4'}>
                <ServerDetailsBlock />
            </div>}

            {/* Graphs above console (option 2) */}
            {graphs == 2 &&
            <div className={'grid lg:grid-cols-4 gap-4 mb-4'}>
                <StatGraphs />
            </div>}

            {/* Main console area */}
            {statsCards == 3 ? (
                /* Side card layout: console 2/3 + side card 1/3 */
                <div className={'lg:grid grid-cols-3 flex flex-col gap-4'}>
                    <div className={'lg:col-span-2'}>
                        <Spinner.Suspense>
                            <Console />
                        </Spinner.Suspense>
                    </div>
                    <div>
                        <ServerSideCard />
                    </div>
                </div>
            ) : (
                /* Default layout: full-width console */
                <div>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
            )}

            {/* Graphs below console (option 3) */}
            {graphs == 3 &&
            <div className={'grid lg:grid-cols-4 gap-4 mt-4'}>
                <StatGraphs />
            </div>}
            
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
