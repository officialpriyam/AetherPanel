import createTicket from '@/api/tickets/createTicket';
import tickets from '@/api/tickets/tickets';
import { TicketListItem, TicketPriority, TicketStatus, TicketsResponseData } from '@/api/tickets/types';
import Button from '@/components/elements/Button';
import Input, { Textarea } from '@/components/elements/Input';
import Modal from '@/components/elements/Modal';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Select from '@/components/elements/Select';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { ChatAlt2Icon, PlusIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
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

const getTicketStatus = (statuses: TicketStatus[], item: TicketListItem) =>
    statuses[item.status_id]?.name || `Status #${item.status_id}`;

const getTicketPriority = (priorities: TicketPriority[], item: TicketListItem) =>
    priorities[item.priority_id]?.name || `Priority #${item.priority_id}`;

export default () => {
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const { data, error, mutate } = useSWR<TicketsResponseData>(['tickets'], tickets);

    const [createOpen, setCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState(0);
    const [priority, setPriority] = useState(0);
    const [relatedServer, setRelatedServer] = useState(0);

    useEffect(() => {
        if (!error) {
            clearFlashes('tickets');
            return;
        }

        clearAndAddHttpError({ key: 'tickets', error });
    }, [error]);

    useEffect(() => {
        if (!data || category !== 0 || data.categories.length < 1) {
            return;
        }

        setCategory(data.categories[0].id);
    }, [data, category]);

    const resetCreateForm = () => {
        setSubject('');
        setMessage('');
        setPriority(0);
        setRelatedServer(0);
        setCategory(data?.categories[0]?.id || 0);
    };

    const onCreateTicket = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!subject.trim()) {
            addFlash({ key: 'tickets', type: 'error', message: 'Please enter a ticket subject.' });
            return;
        }

        if (!message.trim()) {
            addFlash({ key: 'tickets', type: 'error', message: 'Please enter a message.' });
            return;
        }

        setSubmitting(true);
        clearFlashes('tickets');

        try {
            await createTicket({
                category,
                priority,
                message: message.trim(),
                subject: subject.trim(),
                relatedServer,
            });
            await mutate();
            setCreateOpen(false);
            resetCreateForm();
            addFlash({ key: 'tickets', type: 'success', message: 'Ticket created successfully.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'tickets', error: err });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTickets = useMemo(() => {
        if (!data) {
            return [];
        }

        return data.tickets.filter((item) => {
            const matchSearch = search.trim()
                ? `${item.subject} ${item.category} ${item.serverName || ''}`.toLowerCase().includes(search.trim().toLowerCase())
                : true;
            const matchStatus = statusFilter === 'all' ? true : String(item.status_id) === statusFilter;
            const matchCategory = categoryFilter === 'all' ? true : String(item.category_id) === categoryFilter;

            return matchSearch && matchStatus && matchCategory;
        });
    }, [data, search, statusFilter, categoryFilter]);

    return (
        <PageContentBlock title={'Support Tickets'} showFlashKey={'tickets'}>
            <div className={styles.page}>
                <div className={styles.hero}>
                    <div className={styles.heroHead}>
                        <div css={tw`flex items-center gap-3`}>
                            <div css={tw`w-12 h-12 rounded-full border border-primary-500/40 bg-primary-500/10 flex items-center justify-center`}>
                                <ChatAlt2Icon css={tw`w-6 h-6 text-primary-300`} />
                            </div>
                            <div>
                                <h1 className={styles.heroTitle}>Support Tickets</h1>
                                <p className={styles.heroSub}>View and manage your support tickets in one place.</p>
                            </div>
                        </div>
                        <Button type={'button'} onClick={() => setCreateOpen(true)} className={styles.actionButton}>
                            <PlusIcon css={tw`w-4 h-4 mr-1`} />
                            Create Ticket
                        </Button>
                    </div>
                </div>

                {!data ? (
                    <Spinner centered size={'large'} />
                ) : (
                    <>
                        <div className={styles.toolbar}>
                            <Input
                                type={'text'}
                                value={search}
                                onChange={(event) => setSearch(event.currentTarget.value)}
                                placeholder={'Search tickets...'}
                            />
                            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.currentTarget.value)}>
                                <option value={'all'}>All Statuses</option>
                                {data.statuses.map((item, index) => (
                                    <option value={String(index)} key={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </Select>
                            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.currentTarget.value)}>
                                <option value={'all'}>All Categories</option>
                                {data.categories.map((item) => (
                                    <option value={String(item.id)} key={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {filteredTickets.length < 1 ? (
                            <div className={styles.ticketCard}>
                                <p css={tw`text-sm text-gray-300`}>No tickets found for the selected filters.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {filteredTickets.map((item) => (
                                    <NavLink key={item.id} to={`/tickets/${item.id}`}>
                                        <div className={styles.ticketCard}>
                                            <div className={styles.ticketRow}>
                                                <div>
                                                    <h3 className={styles.ticketTitle}>{item.subject}</h3>
                                                    <div className={styles.ticketMeta}>
                                                        <span className={styles.metaText}>#{item.id}</span>
                                                        <span className={styles.metaText}>Category: {item.category}</span>
                                                        <span className={styles.metaText}>
                                                            Server: {item.serverName || 'Not linked'}
                                                        </span>
                                                        <span className={styles.metaText}>Updated: {item.updated_at}</span>
                                                    </div>
                                                </div>
                                                <div css={tw`flex items-center gap-2 flex-wrap`}>
                                                    <span className={styles.badge} style={statusBadgeStyle(item.status_id)}>
                                                        {getTicketStatus(data.statuses, item)}
                                                    </span>
                                                    <span className={styles.badge} style={priorityBadgeStyle(item.priority_id)}>
                                                        {getTicketPriority(data.priorities, item)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <p css={tw`text-sm font-semibold text-gray-100 mb-2`}>Managing Tickets</p>
                                <p css={tw`text-xs text-gray-300`}>
                                    Keep all requests in one place and quickly check subject, status, and latest updates.
                                </p>
                            </div>
                            <div className={styles.infoCard}>
                                <p css={tw`text-sm font-semibold text-gray-100 mb-2`}>Categorization</p>
                                <p css={tw`text-xs text-gray-300`}>
                                    Use category and status filters to locate urgent or unresolved conversations faster.
                                </p>
                            </div>
                            <div
                                className={styles.infoCard}
                                css={tw`border-red-500/40 bg-red-500/10`}
                            >
                                <p css={tw`text-sm font-semibold text-red-200 mb-2`}>Priority Support</p>
                                <p css={tw`text-xs text-red-100/80`}>
                                    High priority tickets are highlighted so they can be handled before routine requests.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal visible={createOpen} onDismissed={() => !submitting && setCreateOpen(false)} dismissable={!submitting}>
                <form onSubmit={onCreateTicket} css={tw`space-y-4`}>
                    <div>
                        <h2 css={tw`text-xl font-semibold text-gray-100`}>Create Ticket</h2>
                        <p css={tw`text-xs text-gray-300 mt-1`}>Fill out the form below to open a new support request.</p>
                    </div>
                    <div css={tw`space-y-3`}>
                        <Input
                            type={'text'}
                            value={subject}
                            onChange={(event) => setSubject(event.currentTarget.value)}
                            placeholder={'Brief summary of the issue'}
                            maxLength={50}
                        />
                        <div css={tw`grid md:grid-cols-3 gap-3`}>
                            <Select value={String(category)} onChange={(event) => setCategory(Number(event.currentTarget.value))}>
                                {data?.categories.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </Select>
                            <Select value={String(priority)} onChange={(event) => setPriority(Number(event.currentTarget.value))}>
                                {data?.priorities.map((item, index) => (
                                    <option key={item.name} value={index}>
                                        {item.name}
                                    </option>
                                ))}
                            </Select>
                            <Select value={String(relatedServer)} onChange={(event) => setRelatedServer(Number(event.currentTarget.value))}>
                                <option value={0}>No related server</option>
                                {data?.servers.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <Textarea
                            value={message}
                            onChange={(event) => setMessage(event.currentTarget.value)}
                            placeholder={'Describe your issue in detail...'}
                            rows={8}
                            maxLength={2000}
                        />
                    </div>
                    <div css={tw`flex items-center justify-end gap-2`}>
                        <Button
                            type={'button'}
                            isSecondary
                            onClick={() => setCreateOpen(false)}
                            disabled={submitting}
                            className={styles.actionButtonSecondary}
                        >
                            Cancel
                        </Button>
                        <Button type={'submit'} isLoading={submitting} disabled={submitting} className={styles.actionButton}>
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageContentBlock>
    );
};
