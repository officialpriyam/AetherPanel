import reply from '@/api/tickets/reply';
import ticket from '@/api/tickets/ticket';
import { TicketMessage, TicketResponseData } from '@/api/tickets/types';
import Button from '@/components/elements/Button';
import { Textarea } from '@/components/elements/Input';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { ArrowLeftIcon, ChatAlt2Icon, CogIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import useSWR from 'swr';
import tw from 'twin.macro';
import styles from './tickets.module.css';

const statusBadgeStyle = (statusId: number) => {
    if (statusId === 2) {
        return {
            color: '#fee2e2',
            borderColor: 'rgb(220 38 38 / 50%)',
            backgroundColor: 'rgb(220 38 38 / 22%)',
        };
    }

    if (statusId === 1) {
        return {
            color: '#fef3c7',
            borderColor: 'rgb(217 119 6 / 50%)',
            backgroundColor: 'rgb(217 119 6 / 22%)',
        };
    }

    return {
        color: '#dcfce7',
        borderColor: 'rgb(22 163 74 / 50%)',
        backgroundColor: 'rgb(22 163 74 / 22%)',
    };
};

const priorityBadgeStyle = (priorityId: number) => {
    if (priorityId === 2) {
        return {
            color: '#fee2e2',
            borderColor: 'rgb(220 38 38 / 50%)',
            backgroundColor: 'rgb(220 38 38 / 22%)',
        };
    }

    if (priorityId === 1) {
        return {
            color: '#fef3c7',
            borderColor: 'rgb(217 119 6 / 50%)',
            backgroundColor: 'rgb(217 119 6 / 22%)',
        };
    }

    return {
        color: '#dbeafe',
        borderColor: 'rgb(37 99 235 / 50%)',
        backgroundColor: 'rgb(37 99 235 / 22%)',
    };
};

const renderAuthor = (message: TicketMessage, userId: number) => {
    if (message.user_id === userId) {
        return 'You';
    }

    return `${message.firstname || ''} ${message.lastname || ''}`.trim() || 'Staff';
};

export default () => {
    const { id } = useParams<{ id: string }>();
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const { data, error, mutate } = useSWR<TicketResponseData>(['ticket', id], () => ticket(id));

    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!error) {
            clearFlashes('ticket-view');
            return;
        }

        clearAndAddHttpError({ key: 'ticket-view', error });
    }, [error]);

    const orderedMessages = useMemo(() => {
        if (!data) {
            return [];
        }

        return [...data.messages].reverse();
    }, [data]);

    const onReply = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!data || !message.trim()) {
            return;
        }

        setSending(true);
        clearFlashes('ticket-view');

        try {
            await reply(data.ticket.id, message.trim());
            setMessage('');
            await mutate();
            addFlash({ key: 'ticket-view', type: 'success', message: 'Reply sent successfully.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'ticket-view', error: err });
        } finally {
            setSending(false);
        }
    };

    if (!data) {
        return (
            <PageContentBlock title={'Ticket'}>
                <Spinner centered size={'large'} />
            </PageContentBlock>
        );
    }

    const statusLabel = data.statuses[data.ticket.status_id]?.name || `Status #${data.ticket.status_id}`;
    const priorityLabel = data.priorities[data.ticket.priority_id]?.name || `Priority #${data.ticket.priority_id}`;
    const isClosed = data.ticket.status_id === 2;

    return (
        <PageContentBlock title={`Ticket #${data.ticket.id}`} showFlashKey={'ticket-view'}>
            <div className={styles.page}>
                <div className={styles.hero}>
                    <div className={styles.heroHead}>
                        <div css={tw`flex items-center gap-3`}>
                            <Link to={'/tickets'} css={tw`inline-flex items-center gap-1 text-xs text-gray-200 hover:text-gray-100`}>
                                <ArrowLeftIcon css={tw`w-4 h-4`} />
                                Back
                            </Link>
                            <div>
                                <h1 className={styles.heroTitle}>{data.ticket.subject}</h1>
                                <p className={styles.heroSub}>Ticket #{data.ticket.id}</p>
                            </div>
                        </div>
                        <div css={tw`flex items-center gap-2 flex-wrap`}>
                            <span className={styles.badge} style={statusBadgeStyle(data.ticket.status_id)}>
                                {statusLabel}
                            </span>
                            <span className={styles.badge} style={priorityBadgeStyle(data.ticket.priority_id)}>
                                {priorityLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.panelGrid}>
                    <div className={styles.panel}>
                        <div css={tw`px-4 py-3 border-b border-gray-600/70 flex items-center gap-2`}>
                            <ChatAlt2Icon css={tw`w-4 h-4 text-primary-300`} />
                            <p css={tw`text-sm font-semibold text-gray-100`}>Conversation</p>
                        </div>
                        <div className={styles.messages}>
                            {orderedMessages.length < 1 ? (
                                <p css={tw`text-sm text-gray-300`}>No messages yet on this ticket.</p>
                            ) : (
                                orderedMessages.map((entry) => (
                                    <article
                                        key={entry.id}
                                        className={`${styles.bubble} ${
                                            entry.user_id === data.ticket.user_id ? styles.bubbleMine : ''
                                        }`}
                                    >
                                        <p className={styles.bubbleMeta}>
                                            {renderAuthor(entry, data.ticket.user_id)} - {entry.sent_at}
                                        </p>
                                        <p css={tw`text-sm text-gray-100 whitespace-pre-wrap break-words m-0`}>
                                            {entry.message}
                                        </p>
                                    </article>
                                ))
                            )}
                        </div>
                        <form onSubmit={onReply} className={styles.panelBody}>
                            <Textarea
                                value={message}
                                onChange={(event) => setMessage(event.currentTarget.value)}
                                placeholder={isClosed ? 'This ticket is closed.' : 'Type your reply here...'}
                                rows={5}
                                maxLength={2000}
                                disabled={isClosed || sending}
                            />
                            <div css={tw`mt-3 flex justify-end`}>
                                <Button
                                    type={'submit'}
                                    isLoading={sending}
                                    disabled={isClosed || sending || !message.trim()}
                                    className={styles.actionButton}
                                >
                                    Send Reply
                                </Button>
                            </div>
                        </form>
                    </div>

                    <aside className={styles.panel}>
                        <div css={tw`px-4 py-3 border-b border-gray-600/70 flex items-center gap-2`}>
                            <CogIcon css={tw`w-4 h-4 text-primary-300`} />
                            <p css={tw`text-sm font-semibold text-gray-100`}>Ticket Details</p>
                        </div>
                        <div className={styles.panelBody}>
                            <div className={styles.detailList}>
                                <div className={styles.detailItem}>
                                    <span>Category</span>
                                    <span>{data.ticket.category}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>Server</span>
                                    <span>
                                        {data.ticket.related_server_id && data.ticket.uuidShort ? (
                                            <NavLink to={`/server/${data.ticket.uuidShort}`} css={tw`text-primary-300 hover:underline`}>
                                                {data.ticket.serverName || 'Linked Server'}
                                            </NavLink>
                                        ) : (
                                            'Not linked'
                                        )}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>Created</span>
                                    <span>{data.ticket.created_at}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>Last Updated</span>
                                    <span>{data.ticket.updated_at}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>Messages</span>
                                    <span>{data.messages.length}</span>
                                </div>
                            </div>
                            <div css={tw`mt-4`}>
                                <Button
                                    type={'button'}
                                    isSecondary
                                    size={'xsmall'}
                                    onClick={() => mutate()}
                                    className={styles.actionButtonSecondary}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </PageContentBlock>
    );
};


