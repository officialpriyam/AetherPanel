import loadDirectory, { FileObject } from '@/api/server/files/loadDirectory';
import searchPlugins from '@/api/server/plugin/searchPlugins';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import PluginCard from '@/components/server/plugin/PluginCard';
import { InstalledPlugin, parseInstalledPlugin, Plugin, pruneFileName, Source } from '@/components/server/plugin/types';
import styles from '@/components/server/addons-style.module.css';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { ViewGridIcon } from '@heroicons/react/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';

const PAGE_SIZE = 16;

const gameVersionOptions = [
    'Any',
    '1.7',
    '1.8',
    '1.9',
    '1.10',
    '1.11',
    '1.12',
    '1.13',
    '1.14',
    '1.15',
    '1.16',
    '1.17',
    '1.18',
    '1.19',
    '1.20',
    '1.21',
];

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);

    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [source, setSource] = useState<Source>(Source.Spigot);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [compatibilityVersion, setCompatibilityVersion] = useState('Any');
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installedFiles, setInstalledFiles] = useState<FileObject[]>([]);
    const [noPluginsFolder, setNoPluginsFolder] = useState(false);

    useEffect(() => {
        document.title = `${name} | Plugin Installer`;
    }, [name]);

    useEffect(() => {
        clearFlashes('plugin-installer');
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(1);
            setSearchTerm(searchInput.trim());
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const refreshInstalled = useCallback(async () => {
        const files = await loadDirectory(uuid, 'plugins/').catch(() => {
            setNoPluginsFolder(true);
            return [] as FileObject[];
        });

        setInstalledFiles(files || []);
    }, [uuid]);

    const fetchPlugins = useCallback(async () => {
        setLoading(true);

        try {
            const data = await searchPlugins(searchTerm, source, page);
            setPlugins(data);
            clearFlashes('plugin-installer');
        } catch (error) {
            clearAndAddHttpError({ key: 'plugin-installer', error });
            setPlugins([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, source, page]);

    useEffect(() => {
        refreshInstalled();
    }, [refreshInstalled]);

    useEffect(() => {
        fetchPlugins();
    }, [fetchPlugins]);

    const findInstalledPlugin = useCallback(
        (plugin: Plugin): InstalledPlugin | null => {
            const normalizedName = pruneFileName(plugin.name).toLowerCase();

            for (const file of installedFiles) {
                const parsed = parseInstalledPlugin(file.name);

                if (parsed && parsed.source === plugin.source && parsed.id === String(plugin.id)) {
                    return parsed;
                }

                const fileName = file.name.toLowerCase();
                if (fileName.includes(normalizedName) && fileName.endsWith('.jar')) {
                    return {
                        fileName: file.name,
                        id: String(plugin.id),
                        source: plugin.source,
                        versionId: String(plugin.versionId),
                    };
                }
            }

            return null;
        },
        [installedFiles]
    );

    const visiblePlugins = useMemo(() => {
        if (compatibilityVersion === 'Any') {
            return plugins;
        }

        return plugins.filter((plugin) => {
            if (plugin.testedVersions.length === 0) {
                return true;
            }

            return plugin.testedVersions.some((value) => value.startsWith(compatibilityVersion));
        });
    }, [plugins, compatibilityVersion]);

    const canGoBack = page > 1;
    const canGoForward = plugins.length >= PAGE_SIZE;

    return (
        <ServerContentBlock title={'Plugin Installer'} icon={ViewGridIcon}>
            <FlashMessageRender byKey={'plugin-installer'} css={tw`mb-4`} />

            <div className={styles.shell}>
                <header className={styles.hero}>
                    <span className={styles.brand}>PriyxStudio Addons</span>
                    <h2 className={styles.title}>Modern Plugin Installer</h2>
                    <p className={styles.subtitle}>
                        Browse and deploy plugins without leaving your panel, with styling rebuilt to match your glass
                        Flash theme.
                    </p>
                </header>

                <section className={styles.controls}>
                    <div className={styles.controlsGrid}>
                        <Input
                            type={'text'}
                            placeholder={'Search plugins'}
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.currentTarget.value)}
                        />
                        <Select value={source} onChange={(event) => setSource(event.currentTarget.value as Source)}>
                            <option value={Source.Spigot}>Spigot</option>
                            <option value={Source.Polymart}>Polymart</option>
                            <option value={Source.Modrinth}>Modrinth</option>
                        </Select>
                        <Select
                            value={compatibilityVersion}
                            onChange={(event) => setCompatibilityVersion(event.currentTarget.value)}
                        >
                            {gameVersionOptions.map((version) => (
                                <option key={version} value={version}>
                                    {version === 'Any' ? 'Any version' : version}
                                </option>
                            ))}
                        </Select>
                        <div css={tw`grid grid-cols-2 gap-2`}>
                            <Button type={'button'} isSecondary disabled={!canGoBack} onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </Button>
                            <Button type={'button'} isSecondary disabled={!canGoForward} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>

                    <div className={styles.pageBar}>
                        <p>Page {page}</p>
                        <p>{source === Source.Spigot ? 'Source: SpigotMC' : source === Source.Polymart ? 'Source: Polymart' : 'Source: Modrinth'}</p>
                    </div>

                    {noPluginsFolder && (
                        <p css={tw`mt-3 text-xs text-yellow-50 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2`}>
                            No `/plugins` folder was found on this server yet. Search works, but installs require that
                            folder to exist.
                        </p>
                    )}
                </section>

                {loading ? (
                    <div css={tw`py-12`}>
                        <Spinner size={'large'} centered />
                    </div>
                ) : visiblePlugins.length === 0 ? (
                    <div className={styles.empty}>No plugins matched this search.</div>
                ) : (
                    <section className={styles.cardGrid}>
                        {visiblePlugins.map((plugin) => (
                            <PluginCard
                                key={`${plugin.source}_${plugin.id}`}
                                plugin={plugin}
                                uuid={uuid}
                                compatibilityVersion={compatibilityVersion}
                                installed={findInstalledPlugin(plugin)}
                                onInstalledChange={refreshInstalled}
                            />
                        ))}
                    </section>
                )}
            </div>
        </ServerContentBlock>
    );
};
