import loadDirectory, { FileObject } from '@/api/server/files/loadDirectory';
import searchMods from '@/api/server/mods/searchMods';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import styles from '@/components/server/addons-style.module.css';
import ModCard from '@/components/server/mods/ModCard';
import { Mod } from '@/components/server/mods/types';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { ArchiveIcon } from '@heroicons/react/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';

const PAGE_SIZE = 16;

const sortOptions: Array<{ label: string; value: number }> = [
    { label: 'Featured', value: 1 },
    { label: 'Popularity', value: 2 },
    { label: 'Recently Updated', value: 3 },
    { label: 'Name', value: 4 },
    { label: 'Author', value: 5 },
    { label: 'Total Downloads', value: 6 },
];

const minecraftVersions = [
    'Any',
    '1.7.10',
    '1.8.9',
    '1.9.4',
    '1.10.2',
    '1.11.2',
    '1.12.2',
    '1.13.2',
    '1.14.4',
    '1.15.2',
    '1.16.5',
    '1.17.1',
    '1.18.2',
    '1.19.2',
    '1.20.2',
    '1.20.4',
    '1.21.1',
];

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);

    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('Any');
    const [sortField, setSortField] = useState(6);
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [mods, setMods] = useState<Mod[]>([]);
    const [installedFiles, setInstalledFiles] = useState<FileObject[]>([]);
    const [noModsFolder, setNoModsFolder] = useState(false);

    useEffect(() => {
        document.title = `${name} | Mod Installer`;
    }, [name]);

    useEffect(() => {
        clearFlashes('mod-installer');
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(0);
            setSearchTerm(searchInput.trim());
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const refreshInstalled = useCallback(async () => {
        const files = await loadDirectory(uuid, 'mods/').catch(() => {
            setNoModsFolder(true);
            return [] as FileObject[];
        });

        setInstalledFiles(files || []);
    }, [uuid]);

    const fetchMods = useCallback(async () => {
        setLoading(true);

        try {
            const data = await searchMods(page, searchTerm, sortField);
            setMods(data);
            clearFlashes('mod-installer');
        } catch (error) {
            clearAndAddHttpError({ key: 'mod-installer', error });
            setMods([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, sortField]);

    useEffect(() => {
        refreshInstalled();
    }, [refreshInstalled]);

    useEffect(() => {
        fetchMods();
    }, [fetchMods]);

    const visibleMods = useMemo(() => {
        if (selectedVersion === 'Any') {
            return mods;
        }

        return mods.filter((mod) => {
            const versions = mod.latestFilesIndexes || [];
            return versions.some((entry) => entry.gameVersion === selectedVersion);
        });
    }, [mods, selectedVersion]);

    const findInstalledFile = useCallback(
        (mod: Mod): string | null => {
            const slug = mod.slug.toLowerCase();

            for (const file of installedFiles) {
                const nameLower = file.name.toLowerCase();
                if (nameLower.includes(slug) && nameLower.endsWith('.jar')) {
                    return file.name;
                }
            }

            return null;
        },
        [installedFiles]
    );

    const canGoBack = page > 0;
    const canGoForward = mods.length >= PAGE_SIZE;

    return (
        <ServerContentBlock title={'Mod Installer'} icon={ArchiveIcon}>
            <FlashMessageRender byKey={'mod-installer'} css={tw`mb-4`} />

            <div className={styles.shell}>
                <header className={styles.hero}>
                    <span className={styles.brand}>PriyxStudio Addons</span>
                    <h2 className={styles.title}>Modern Mod Installer</h2>
                    <p className={styles.subtitle}>
                        Install Minecraft mods directly from a rebuilt glass panel experience that matches your current
                        theme.
                    </p>
                </header>

                <section className={styles.controls}>
                    <div className={styles.controlsGrid}>
                        <Input
                            type={'text'}
                            placeholder={'Search mods'}
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.currentTarget.value)}
                        />
                        <Select
                            value={String(sortField)}
                            onChange={(event) => {
                                setPage(0);
                                setSortField(Number(event.currentTarget.value));
                            }}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        <Select value={selectedVersion} onChange={(event) => setSelectedVersion(event.currentTarget.value)}>
                            {minecraftVersions.map((version) => (
                                <option key={version} value={version}>
                                    {version === 'Any' ? 'Any version' : version}
                                </option>
                            ))}
                        </Select>
                        <div css={tw`grid grid-cols-2 gap-2`}>
                            <Button
                                type={'button'}
                                isSecondary
                                disabled={!canGoBack}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                type={'button'}
                                isSecondary
                                disabled={!canGoForward}
                                onClick={() => setPage((value) => value + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                    <div className={styles.pageBar}>
                        <p>Page {page + 1}</p>
                        <p>Sort: {sortOptions.find((option) => option.value === sortField)?.label || 'Downloads'}</p>
                    </div>

                    {noModsFolder && (
                        <p css={tw`mt-3 text-xs text-yellow-50 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2`}>
                            No `/mods` folder was found on this server yet. Search works, but installs require that
                            folder to exist.
                        </p>
                    )}
                </section>

                {loading ? (
                    <div css={tw`py-12`}>
                        <Spinner size={'large'} centered />
                    </div>
                ) : visibleMods.length === 0 ? (
                    <div className={styles.empty}>No mods matched this search.</div>
                ) : (
                    <section className={styles.cardGrid}>
                        {visibleMods.map((mod) => (
                            <ModCard
                                key={mod.id}
                                mod={mod}
                                uuid={uuid}
                                selectedVersion={selectedVersion}
                                installedFile={findInstalledFile(mod)}
                                onInstalledChange={refreshInstalled}
                            />
                        ))}
                    </section>
                )}
            </div>
        </ServerContentBlock>
    );
};
