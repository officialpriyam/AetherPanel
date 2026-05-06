import createServerSubdomain from '@/api/server/subdomain/createServerSubdomain';
import deleteServerSubdomain from '@/api/server/subdomain/deleteServerSubdomain';
import getServerSubdomains, { SubdomainResponse } from '@/api/server/subdomain/getServerSubdomains';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import styles from '@/components/server/addons-style.module.css';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { GlobeIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data!.name);

    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    const [subdomain, setSubdomain] = useState('');
    const [domainId, setDomainId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, error, mutate } = useSWR<SubdomainResponse>([uuid, '/subdomain'], (id: string) => getServerSubdomains(id), {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        document.title = `${serverName} | Subdomain Manager`;
    }, [serverName]);

    useEffect(() => {
        clearFlashes('subdomain-manager');
    }, []);

    useEffect(() => {
        if (!error) {
            return;
        }

        clearAndAddHttpError({ key: 'subdomain-manager', error });
    }, [error]);

    useEffect(() => {
        if (!data || domainId !== null || data.domains.length === 0) {
            return;
        }

        setDomainId(data.domains[0].id);
    }, [data, domainId]);

    const isDomainAvailable = useMemo(() => (data?.domains?.length || 0) > 0, [data]);

    const onCreate = async () => {
        if (!domainId) {
            addFlash({ key: 'subdomain-manager', type: 'error', message: 'Please choose a domain first.' });

            return;
        }

        const value = subdomain.trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/.test(value)) {
            addFlash({
                key: 'subdomain-manager',
                type: 'error',
                message: 'Invalid subdomain. Use lowercase letters, numbers, and hyphens only.',
            });

            return;
        }

        clearFlashes('subdomain-manager');
        setSubmitting(true);

        try {
            await createServerSubdomain(uuid, value, domainId);
            setSubdomain('');
            await mutate();
            addFlash({ key: 'subdomain-manager', type: 'success', message: 'Subdomain created successfully.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'subdomain-manager', error: err });
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (id: number) => {
        if (!window.confirm('Delete this subdomain? This will remove the DNS record as well.')) {
            return;
        }

        clearFlashes('subdomain-manager');
        setDeletingId(id);

        try {
            await deleteServerSubdomain(uuid, id);
            await mutate();
            addFlash({ key: 'subdomain-manager', type: 'success', message: 'Subdomain deleted.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'subdomain-manager', error: err });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <ServerContentBlock title={'Subdomain Manager'} icon={GlobeIcon}>
            <FlashMessageRender byKey={'subdomain-manager'} css={tw`mb-4`} />

            {!data ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className={styles.shell}>
                    <header className={styles.hero}>
                        <span className={styles.brand}>PriyxStudio Addons</span>
                        <h2 className={styles.title}>Glassy Subdomain Manager</h2>
                        <p className={styles.subtitle}>
                            Create and manage DNS records from your themed panel without leaving the server page.
                        </p>
                    </header>

                    <section className={styles.controls}>
                        {isDomainAvailable ? (
                            <>
                                <div css={tw`grid md:grid-cols-12 gap-3`}>
                                    <div css={tw`md:col-span-5`}>
                                        <Input
                                            type={'text'}
                                            placeholder={'myserver'}
                                            value={subdomain}
                                            onChange={(event) => setSubdomain(event.currentTarget.value)}
                                        />
                                    </div>
                                    <div css={tw`md:col-span-4`}>
                                        <Select
                                            value={String(domainId || data.domains[0].id)}
                                            onChange={(event) => setDomainId(Number(event.currentTarget.value))}
                                        >
                                            {data.domains.map((domain) => (
                                                <option key={domain.id} value={domain.id}>
                                                    {domain.domain}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div css={tw`md:col-span-3`}>
                                        <Button
                                            type={'button'}
                                            disabled={submitting}
                                            css={tw`w-full`}
                                            onClick={onCreate}
                                        >
                                            {submitting ? 'Creating...' : 'Create Subdomain'}
                                        </Button>
                                    </div>
                                </div>
                                <p css={tw`text-xs text-gray-300 mt-3`}>
                                    Current allocation endpoint: <code>{data.ipAlias || 'Unknown'}</code>
                                </p>
                            </>
                        ) : (
                            <div className={styles.empty}>
                                No domain mappings are available for this server egg. Add one in Admin {'>'} Settings {'>'}
                                Subdomain.
                            </div>
                        )}
                    </section>

                    <section className={styles.cardGrid}>
                        {data.subdomains.length < 1 ? (
                            <div className={styles.empty}>No subdomains created for this server yet.</div>
                        ) : (
                            data.subdomains.map((entry) => (
                                <article key={entry.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h3 className={styles.cardName}>
                                                {entry.subdomain}.{entry.domain || 'unknown-domain'}
                                                {entry.record_type === 'CNAME' ? `:${entry.port}` : ''}
                                            </h3>
                                            <p className={styles.cardSummary}>Target: {data.ipAlias}:{entry.port}</p>
                                        </div>
                                    </div>
                                    <div className={styles.tagRow}>
                                        <span className={`${styles.tag} ${styles.tagInfo}`}>Record: {entry.record_type}</span>
                                        <span className={styles.tag}>Port: {entry.port}</span>
                                    </div>
                                    <div css={tw`mt-4`}>
                                        <Button
                                            type={'button'}
                                            size={'xsmall'}
                                            color={'red'}
                                            isSecondary
                                            disabled={deletingId === entry.id}
                                            onClick={() => onDelete(entry.id)}
                                        >
                                            {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                </div>
            )}
        </ServerContentBlock>
    );
};
