import React, { useEffect, useMemo, useState } from 'react';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import getServers from '@/api/getServers';
import ServerCard from '@/components/dashboard/ServerCard';
import ServerCardBanner from '@/components/dashboard/ServerCardBanner';
import ServerCardGradient from '@/components/dashboard/ServerCardGradient';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import styles from './dashboard-home.module.css';

export default () => {
    const { t } = useTranslation('flash/dashboard');
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [page, setPage] = useState(1);
    const serverRow = useStoreState((state: ApplicationStore) => state.settings.data!.flash.serverRow);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [query, setQuery] = useState('');
    const [runningOnly, setRunningOnly] = useState(false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', page, showOnlyAdmin && rootAdmin],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard-servers', error });
        if (!error) clearFlashes('dashboard-servers');
    }, [error]);

    const filteredItems = useMemo(() => {
        if (!servers) return [];
        return servers.items.filter((server) => {
            const matchesQuery = query.trim().length < 1
                ? true
                : server.name.toLowerCase().includes(query.trim().toLowerCase());
            const matchesRunning = runningOnly ? server.status !== null : true;
            return matchesQuery && matchesRunning;
        });
    }, [servers, query, runningOnly]);

    const renderServerCard = (server: Server) => {
        if (serverRow == 1) return <ServerCardGradient key={server.uuid} server={server} />;
        if (serverRow == 2) return <ServerCardBanner key={server.uuid} server={server} />;
        return <ServerCard key={server.uuid} server={server} />;
    };

    return (
        <PageContentBlock title={'Servers'} showFlashKey={'dashboard-servers'}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h3 className={styles.cardTitle}>Servers</h3>
                        <p className={styles.cardSub}>Manage your game server infrastructure.</p>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search servers..."
                        value={query}
                        onChange={(event) => setQuery(event.currentTarget.value)}
                    />
                    <div className={styles.toolbarControls}>
                        {rootAdmin && (
                            <div className={styles.toggleRow}>
                                <span className={styles.toggleLabel}>
                                    {showOnlyAdmin ? t('others-servers') : t('your-servers')}
                                </span>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin((s) => !s)}
                                />
                            </div>
                        )}
                        <div className={styles.toggleRow}>
                            <span className={styles.toggleLabel}>Running only</span>
                            <Switch
                                name={'running_only'}
                                defaultChecked={runningOnly}
                                onChange={() => setRunningOnly((s) => !s)}
                            />
                        </div>
                    </div>
                </div>

                {!servers ? (
                    <Spinner centered size={'large'} />
                ) : (
                    <Pagination data={servers} onPageSelect={setPage}>
                        {() => (
                            <div className={styles.serverGrid}>
                                {filteredItems.length < 1 ? (
                                    <div className={styles.empty}>No servers match your filters.</div>
                                ) : (
                                    filteredItems.map((server: Server) => renderServerCard(server))
                                )}
                            </div>
                        )}
                    </Pagination>
                )}
            </div>
        </PageContentBlock>
    );
};
