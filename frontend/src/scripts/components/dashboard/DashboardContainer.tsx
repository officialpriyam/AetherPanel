import React, { useEffect, useMemo } from 'react';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import getServers, { getServersSwrKey } from '@/api/getServers';
import ServerCard from '@/components/dashboard/ServerCard';
import ServerCardBanner from '@/components/dashboard/ServerCardBanner';
import ServerCardGradient from '@/components/dashboard/ServerCardGradient';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { LuChevronRight, LuCreditCard, LuRouter, LuWandSparkles } from 'react-icons/lu';
import { FaDiscord } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActivityLogs } from '@/api/account/activity';
import { formatDistanceToNowStrict } from 'date-fns';
import tickets, { EMPTY_TICKETS_RESPONSE } from '@/api/tickets/tickets';
import { TicketsResponseData } from '@/api/tickets/types';
import UserAvatar from '@/components/UserAvatar';
import styles from './dashboard-home.module.css';

export default () => {
    const { t } = useTranslation('flash/dashboard');
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const firstName = useStoreState((state) => state.user.data!.firstName);
    const username = useStoreState((state) => state.user.data!.username);
    const email = useStoreState((state) => state.user.data!.email);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const socialButtons = useStoreState((state: ApplicationStore) => state.settings.data!.flash.socialButtons);
    const socialDiscord = useStoreState((state: ApplicationStore) => state.settings.data!.flash.social_discord);
    const socialBilling = useStoreState((state: ApplicationStore) => state.settings.data!.flash.social_billing);
    const socialStatus = useStoreState((state: ApplicationStore) => state.settings.data!.flash.social_status);
    const socialCustom = useStoreState((state: ApplicationStore) => state.settings.data!.flash.social_custom);
    const socialCustomIcon = useStoreState((state: ApplicationStore) => state.settings.data!.flash.social_custom_icon);
    const knowledgeBaseUrl = useStoreState((state: ApplicationStore) => state.settings.data!.flash.knowledge_base_url);
    const serverRow = useStoreState((state: ApplicationStore) => state.settings.data!.flash.serverRow);
    const ticketAddonEnabled = String(
        useStoreState((state: ApplicationStore) => state.settings.data!.flash.addon_ticket_system_enabled)
    ) === 'true';

    const serverType = showOnlyAdmin && rootAdmin ? 'admin' : undefined;
    const { data: servers, error } = useSWR(
        getServersSwrKey({ page: 1, type: serverType }),
        () => getServers({ page: 1, type: serverType }),
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const { data: activityData } = useActivityLogs({ page: 1, sorts: { timestamp: -1 } });
    const { data: ticketData } = useSWR<TicketsResponseData>(
        ticketAddonEnabled ? ['dashboard', 'tickets'] : null,
        async () => {
            try {
                return await tickets({ timeout: 8000 });
            } catch {
                return EMPTY_TICKETS_RESPONSE;
            }
        },
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const recentServers = useMemo(() => servers?.items?.slice(0, 4) || [], [servers]);
    const recentTickets = useMemo(() => ticketData?.tickets?.slice(0, 4) || [], [ticketData]);
    const recentActivity = useMemo(() => activityData?.items?.slice(0, 5) || [], [activityData]);

    const socialCardStyle: React.CSSProperties = {
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        boxShadow: '0 18px 42px rgba(2, 6, 23, 0.18)',
    };

    const renderServerCard = (server: Server) => {
        if (serverRow == 1) return <ServerCardGradient key={server.uuid} server={server} />;
        if (serverRow == 2) return <ServerCardBanner key={server.uuid} server={server} />;
        return <ServerCard key={server.uuid} server={server} />;
    };

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {String(socialButtons) == 'true' && (
                <div className={'flex lg:gap-4 gap-2 lg:flex-row flex-col mb-4'}>
                    {socialDiscord && (
                        <a href={socialDiscord} target="_blank" className={'group w-full backdrop rounded-box flex items-center justify-between px-6 py-5'} style={socialCardStyle}>
                            <div>
                                <p className={'font-medium text-gray-100 flex items-center'}>
                                    Discord
                                    <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                                </p>
                                <span className={'font-light text-sm text-gray-200'}>{t('join-our-discord')}</span>
                            </div>
                            <FaDiscord className={'text-[2.5rem] text-gray-200'} />
                        </a>
                    )}
                    {socialBilling && (
                        <a href={socialBilling} target="_blank" className={'group w-full backdrop rounded-box flex items-center justify-between px-6 py-5'} style={socialCardStyle}>
                            <div>
                                <p className={'font-medium text-gray-100 flex items-center'}>
                                    {t('billing-area')}
                                    <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                                </p>
                                <span className={'font-light text-sm text-gray-200'}>{t('manage-your-services')}</span>
                            </div>
                            <LuCreditCard className={'text-[2.5rem] text-gray-200'} />
                        </a>
                    )}
                    {socialStatus && (
                        <a href={socialStatus} target="_blank" className={'group w-full backdrop rounded-box flex items-center justify-between px-6 py-5'} style={socialCardStyle}>
                            <div>
                                <p className={'font-medium text-gray-100 flex items-center'}>
                                    {t('server-status')}
                                    <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                                </p>
                                <span className={'font-light text-sm text-gray-200'}>{t('check-server-status')}</span>
                            </div>
                            <LuRouter className={'text-[2.5rem] text-gray-200'} />
                        </a>
                    )}
                    {socialCustom && (
                        <a href={socialCustom} target="_blank" className={'group w-full backdrop rounded-box flex items-center justify-between px-6 py-5'} style={socialCardStyle}>
                            <div>
                                <p className={'font-medium text-gray-100 flex items-center gap-1 uppercase'}>
                                    {socialCustomIcon || 'Link'}
                                    <LuChevronRight className={'opacity-0 ml-0 group-hover:opacity-75 group-hover:ml-2 duration-300'} />
                                </p>
                                <span className={'font-light text-sm text-gray-200'}>Visit link</span>
                            </div>
                            <LuWandSparkles className={'text-[2.5rem] text-gray-200'} />
                        </a>
                    )}
                </div>
            )}

            <div className={styles.heroCard}>
                <div className={styles.heroContent}>
                    <div>
                        <p className={styles.heroTitle}>Welcome back, {firstName || 'User'}</p>
                        <p className={styles.heroSubTitle}>Monitor your infrastructure and manage your services.</p>
                    </div>
                    <div className={styles.heroActions}>
                        {rootAdmin && (
                            <a href={'/admin/flash/'} className={styles.heroGhostButton}>
                                <LuWandSparkles />
                                Flash Settings
                            </a>
                        )}
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
                    </div>
                </div>
            </div>

            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className={styles.dashboardGrid}>
                    <div className={styles.mainColumn}>
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3 className={styles.cardTitle}>Resources</h3>
                                    <p className={styles.cardSub}>Your latest servers and services.</p>
                                </div>
                                <div className={styles.cardActions}>
                                    <span className={styles.tabActive}>All</span>
                                    <Link to={'/dashboard/servers'} className={styles.cardLink}>View All</Link>
                                </div>
                            </div>
                            <div className={styles.serverGrid}>
                                {recentServers.length < 1 ? (
                                    <div className={styles.empty}>No servers available.</div>
                                ) : (
                                    recentServers.map((server: Server) => renderServerCard(server))
                                )}
                            </div>
                        </section>

                        {ticketAddonEnabled && (
                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>Recent Support Tickets</h3>
                                        <p className={styles.cardSub}>Stay on top of your latest requests.</p>
                                    </div>
                                    <NavLink to={'/tickets'} className={styles.cardLink}>View All Tickets</NavLink>
                                </div>
                                <div className={styles.list}>
                                    {recentTickets.length < 1 ? (
                                        <div className={styles.empty}>No recent tickets.</div>
                                    ) : (
                                        recentTickets.map((ticket) => {
                                            const status = ticketData?.statuses?.[ticket.status_id];
                                            const priority = ticketData?.priorities?.[ticket.priority_id];
                                            return (
                                                <NavLink key={ticket.id} to={`/tickets/${ticket.id}`} className={styles.listRow}>
                                                    <div className={styles.listMain}>
                                                        <p className={styles.listTitle}>{ticket.subject}</p>
                                                        <p className={styles.listMeta}>Category: {ticket.category} • {ticket.created_at}</p>
                                                    </div>
                                                    <div className={styles.ticketBadges}>
                                                        {status && (
                                                            <span className={styles.ticketPill} style={{ backgroundColor: `${status.color}33`, color: status.color }}>
                                                                {status.name}
                                                            </span>
                                                        )}
                                                        {priority && (
                                                            <span className={styles.ticketPill} style={{ backgroundColor: `${priority.color}33`, color: priority.color }}>
                                                                {priority.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </NavLink>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        )}

                        {knowledgeBaseUrl && (
                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardTitle}>Knowledge Base</h3>
                                        <p className={styles.cardSub}>Guides, articles, and self-help resources.</p>
                                    </div>
                                    <a href={knowledgeBaseUrl} target="_blank" rel="noreferrer" className={styles.cardLink}>View All</a>
                                </div>
                                <div className={styles.knowledgeCard}>
                                    <p className={styles.knowledgeTitle}>Browse articles and common fixes.</p>
                                    <p className={styles.knowledgeSub}>Open the knowledge base to search docs and tutorials.</p>
                                    <a href={knowledgeBaseUrl} target="_blank" rel="noreferrer" className={styles.knowledgeButton}>Open Knowledge Base</a>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className={styles.sideColumn}>
                        <div className={styles.profileCard}>
                            <div className={styles.profileAvatar}>
                                <UserAvatar email={email} user={username} uuid={uuid} width={'54px'} />
                            </div>
                            <div>
                                <p className={styles.profileName}>{firstName || username}</p>
                                <p className={styles.profileRole}>{rootAdmin ? 'Administrator' : 'User'}</p>
                                <p className={styles.profileUser}>@{username}</p>
                            </div>
                        </div>

                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3 className={styles.cardTitle}>Recent Activity</h3>
                                    <p className={styles.cardSub}>Latest account activity.</p>
                                </div>
                                <NavLink to={'/account/activity'} className={styles.cardLink}>View All</NavLink>
                            </div>
                            <div className={styles.activityList}>
                                {recentActivity.length < 1 ? (
                                    <div className={styles.empty}>No recent activity.</div>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className={styles.activityRow}>
                                            <span className={styles.activityDot}></span>
                                            <div>
                                                <p className={styles.activityTitle}>{activity.event}</p>
                                                <p className={styles.activityMeta}>
                                                    {activity.relationships.actor?.username || 'System'} •{' '}
                                                    {formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </PageContentBlock>
    );
};



