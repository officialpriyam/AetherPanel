import getSplittedServer from '@/api/server/splitted/getSplittedServer';
import removeSplitServer from '@/api/server/splitted/removeSplitServer';
import splitServer from '@/api/server/splitted/splitServer';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import styles from '@/components/server/addons-style.module.css';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { CogIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data!.name);

    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const { data, error, mutate, isValidating } = getSplittedServer(uuid);

    const [submitting, setSubmitting] = useState(false);
    const [deletingUuid, setDeletingUuid] = useState('');

    const [name, setName] = useState('');
    const [cpu, setCpu] = useState('1');
    const [memory, setMemory] = useState('512');
    const [disk, setDisk] = useState('1024');
    const [swap, setSwap] = useState('0');
    const [copySubusers, setCopySubusers] = useState(false);

    useEffect(() => {
        document.title = `${serverName} | Split Manager`;
    }, [serverName]);

    useEffect(() => {
        clearFlashes('split-manager');
    }, []);

    useEffect(() => {
        if (!error) {
            return;
        }

        clearAndAddHttpError({ key: 'split-manager', error });
    }, [error]);

    useEffect(() => {
        if (!name && serverName) {
            setName(`${serverName} (Split)`);
        }
    }, [name, serverName]);

    const splitCount = useMemo(() => {
        if (!data) {
            return 0;
        }

        return data.servers.filter((entry) => !entry.master).length;
    }, [data]);

    const canSplitMore = useMemo(() => {
        if (!data) {
            return false;
        }

        return data.split_limit > splitCount;
    }, [data, splitCount]);

    const onSplit = async () => {
        const nextCpu = Number(cpu);
        const nextMemory = Number(memory);
        const nextDisk = Number(disk);
        const nextSwap = Number(swap);

        if (!name.trim()) {
            addFlash({ key: 'split-manager', type: 'error', message: 'Please provide a server name.' });

            return;
        }

        if (Number.isNaN(nextCpu) || Number.isNaN(nextMemory) || Number.isNaN(nextDisk) || Number.isNaN(nextSwap)) {
            addFlash({ key: 'split-manager', type: 'error', message: 'Please enter valid numeric resource values.' });

            return;
        }

        clearFlashes('split-manager');
        setSubmitting(true);

        try {
            await splitServer(uuid, nextCpu, nextMemory, nextDisk, nextSwap, name.trim(), copySubusers);
            await mutate();
            addFlash({ key: 'split-manager', type: 'success', message: 'Split server created successfully.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'split-manager', error: err });
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (targetUuid: string, masterUuid: string) => {
        if (!window.confirm('Delete this split server and merge resources back to the master server?')) {
            return;
        }

        clearFlashes('split-manager');
        setDeletingUuid(targetUuid);

        try {
            await removeSplitServer(uuid, masterUuid, targetUuid);
            await mutate();
            addFlash({ key: 'split-manager', type: 'success', message: 'Split server removed.' });
        } catch (err) {
            clearAndAddHttpError({ key: 'split-manager', error: err });
        } finally {
            setDeletingUuid('');
        }
    };

    return (
        <ServerContentBlock title={'Split Server Manager'} icon={CogIcon}>
            <FlashMessageRender byKey={'split-manager'} css={tw`mb-4`} />

            {!data || isValidating ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className={styles.shell}>
                    <header className={styles.hero}>
                        <span className={styles.brand}>PriyxStudio Addons</span>
                        <h2 className={styles.title}>Resource Split Manager</h2>
                        <p className={styles.subtitle}>
                            Split server resources into child servers with a safer flow and glass-style interface.
                        </p>
                    </header>

                    <section className={styles.controls}>
                        <div css={tw`flex flex-wrap gap-2`}>
                            <span className={styles.tag}>Split Limit: {data.split_limit}</span>
                            <span className={styles.tag}>Children: {splitCount}</span>
                            <span className={`${styles.tag} ${canSplitMore ? styles.tagSuccess : styles.tagWarn}`}>
                                {canSplitMore ? 'Can create more' : 'Limit reached'}
                            </span>
                        </div>

                        <div css={tw`mt-4 grid md:grid-cols-2 gap-3 text-xs text-gray-300`}>
                            <div css={tw`rounded-lg border border-gray-600/60 p-3 bg-gray-800/40`}>
                                Current Server Remaining: CPU {data.total.cpu}% / RAM {data.total.memory}MB / Disk {data.total.disk}MB /
                                Swap {data.total.swap}MB
                            </div>
                            <div css={tw`rounded-lg border border-gray-600/60 p-3 bg-gray-800/40`}>
                                Full Split Group Total: CPU {data.totalall.cpu}% / RAM {data.totalall.memory}MB / Disk {data.totalall.disk}MB /
                                Swap {data.totalall.swap}MB
                            </div>
                        </div>

                        {data.split_limit > 0 && (
                            <div css={tw`mt-4 grid md:grid-cols-6 gap-3`}>
                                <div css={tw`md:col-span-2`}>
                                    <Input type={'text'} value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder={'Split server name'} />
                                </div>
                                <Input type={'number'} min={1} value={cpu} onChange={(e) => setCpu(e.currentTarget.value)} placeholder={'CPU'} />
                                <Input type={'number'} min={512} value={memory} onChange={(e) => setMemory(e.currentTarget.value)} placeholder={'RAM MB'} />
                                <Input type={'number'} min={1} value={disk} onChange={(e) => setDisk(e.currentTarget.value)} placeholder={'Disk MB'} />
                                <Input type={'number'} min={0} value={swap} onChange={(e) => setSwap(e.currentTarget.value)} placeholder={'Swap MB'} />
                            </div>
                        )}

                        {data.split_limit > 0 && (
                            <div css={tw`mt-3 flex flex-wrap items-center justify-between gap-3`}>
                                <label css={tw`flex items-center text-xs text-gray-300 gap-2`}>
                                    <input
                                        type={'checkbox'}
                                        checked={copySubusers}
                                        onChange={(event) => setCopySubusers(event.currentTarget.checked)}
                                    />
                                    Copy subusers to the new split server
                                </label>

                                <Button type={'button'} disabled={!canSplitMore || submitting} onClick={onSplit}>
                                    {submitting ? 'Splitting...' : 'Create Split Server'}
                                </Button>
                            </div>
                        )}
                    </section>

                    <section className={styles.cardGrid}>
                        {data.servers.map((entry) => (
                            <article key={entry.uuid} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h3 className={styles.cardName}>{entry.name}</h3>
                                        <p className={styles.cardSummary}>
                                            UUID: <code>{entry.uuidShort}</code>
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.tagRow}>
                                    <span className={`${styles.tag} ${entry.master ? styles.tagSuccess : styles.tagInfo}`}>
                                        {entry.master ? 'Master' : 'Child'}
                                    </span>
                                    <span className={styles.tag}>CPU {entry.cpu}%</span>
                                    <span className={styles.tag}>RAM {entry.memory}MB</span>
                                    <span className={styles.tag}>Disk {entry.disk}MB</span>
                                </div>
                                <div css={tw`mt-4 flex items-center justify-between gap-2`}>
                                    <NavLink to={`../${entry.uuidShort}`} css={tw`text-xs text-primary-400 hover:underline`}>
                                        Open Server
                                    </NavLink>
                                    {!entry.master && (
                                        <Button
                                            type={'button'}
                                            size={'xsmall'}
                                            color={'red'}
                                            isSecondary
                                            disabled={deletingUuid === entry.uuid}
                                            onClick={() => onDelete(entry.uuid, data.master)}
                                        >
                                            {deletingUuid === entry.uuid ? 'Removing...' : 'Remove'}
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            )}
        </ServerContentBlock>
    );
};
