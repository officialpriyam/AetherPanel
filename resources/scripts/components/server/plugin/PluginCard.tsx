import getDownloadUrl from '@/api/server/plugin/getDownloadUrl';
import getVersions from '@/api/server/plugin/getVersions';
import downloadFileFromUrl from '@/api/server/files/downloadFileFromUrl';
import deleteFiles from '@/api/server/files/deleteFiles';
import Button from '@/components/elements/Button';
import Modal from '@/components/elements/Modal';
import useFlash from '@/plugins/useFlash';
import { InstalledPlugin, Plugin, pruneFileName, Source, Version } from '@/components/server/plugin/types';
import React, { useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';
import styles from '@/components/server/addons-style.module.css';

interface Props {
    plugin: Plugin;
    uuid: string;
    installed: InstalledPlugin | null;
    compatibilityVersion: string;
    onInstalledChange: () => Promise<void>;
}

const sourcePrefix = (source: Source): string => {
    if (source === Source.Polymart) {
        return 'P';
    }

    if (source === Source.Modrinth) {
        return 'M';
    }

    return 'S';
};

const sourceLabel = (source: Source): string => {
    if (source === Source.Polymart) {
        return 'Polymart';
    }

    if (source === Source.Modrinth) {
        return 'Modrinth';
    }

    return 'Spigot';
};

const sourceColorClass = (source: Source): string => {
    if (source === Source.Polymart) {
        return styles.tagInfo;
    }

    if (source === Source.Modrinth) {
        return styles.tagWarn;
    }

    return styles.tagSuccess;
};

const isJarUrl = (value?: string): boolean => {
    if (!value) {
        return false;
    }

    return value.toLowerCase().includes('.jar');
};

export default ({ plugin, uuid, installed, compatibilityVersion, onInstalledChange }: Props) => {
    const { addFlash } = useFlash();

    const [isWorking, setIsWorking] = useState(false);
    const [versionsOpen, setVersionsOpen] = useState(false);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [versions, setVersions] = useState<Version[]>([]);
    const [token, setToken] = useState<string | null>(null);

    const isInstalled = !!installed;
    const hasUpdate = isInstalled && !!installed?.versionId && String(installed.versionId) !== String(plugin.versionId);

    const isCompatible = useMemo(() => {
        if (compatibilityVersion === 'Any') {
            return true;
        }

        if (plugin.testedVersions.length === 0) {
            return true;
        }

        return plugin.testedVersions.some((entry) => entry.startsWith(compatibilityVersion));
    }, [compatibilityVersion, plugin.testedVersions]);

    useEffect(() => {
        const cachedToken = localStorage.getItem('POLYMART_API_TOKEN') || sessionStorage.getItem('POLYMART_API_TOKEN');
        setToken(cachedToken);
    }, []);

    const openMarketplace = () => {
        if (plugin.source === Source.Spigot) {
            window.open(`https://spigotmc.org/resources/${plugin.id}`, '_blank', 'noopener,noreferrer');
            return;
        }

        if (plugin.source === Source.Polymart) {
            window.open(plugin.externalUrl || `https://polymart.org/resource/${plugin.id}`, '_blank', 'noopener,noreferrer');
            return;
        }

        window.open(plugin.externalUrl || `https://modrinth.com/plugin/${plugin.id}`, '_blank', 'noopener,noreferrer');
    };

    const installVersion = async (targetVersion?: Version) => {
        setIsWorking(true);

        try {
            if (installed?.fileName && !hasUpdate && !targetVersion) {
                await deleteFiles(uuid, '/plugins', [installed.fileName]);
                addFlash({ key: 'plugin-installer', type: 'success', message: `${plugin.name} removed.` });
                await onInstalledChange();
                return;
            }

            let downloadUrl = targetVersion?.downloadUrl || '';
            const versionId = targetVersion?.id ?? plugin.versionId;

            if (plugin.source === Source.Spigot) {
                if (plugin.premium || (plugin.external && !isJarUrl(plugin.externalUrl))) {
                    openMarketplace();
                    return;
                }

                if (!downloadUrl) {
                    downloadUrl = plugin.external
                        ? String(plugin.externalUrl || '')
                        : await getDownloadUrl(plugin, plugin.id, Source.Spigot, versionId);
                }
            } else if (plugin.source === Source.Polymart) {
                if (!plugin.canDownload) {
                    openMarketplace();
                    return;
                }

                if (!downloadUrl) {
                    downloadUrl = await getDownloadUrl(plugin, plugin.id, Source.Polymart, versionId, token);
                }

                if (!isJarUrl(downloadUrl)) {
                    window.open(downloadUrl || plugin.externalUrl, '_blank', 'noopener,noreferrer');
                    return;
                }
            } else {
                if (!downloadUrl) {
                    downloadUrl = await getDownloadUrl(plugin, plugin.id, Source.Modrinth, versionId);
                }
            }

            if (!downloadUrl) {
                throw new Error('Could not find a valid download URL for this plugin.');
            }

            if (installed?.fileName) {
                await deleteFiles(uuid, '/plugins', [installed.fileName]);
            }

            const fileName = `${pruneFileName(plugin.name)}-${sourcePrefix(plugin.source)}${plugin.id}-${versionId}.jar`;
            await downloadFileFromUrl(uuid, downloadUrl, '/plugins', fileName);

            addFlash({ key: 'plugin-installer', type: 'success', message: `${plugin.name} install queued.` });
            await onInstalledChange();
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'plugin-installer',
                type: 'error',
                message: `Could not process ${plugin.name}. Please try again.`,
            });
        } finally {
            setIsWorking(false);
        }
    };

    const openVersions = async () => {
        setVersionsOpen(true);
        setVersionsLoading(true);

        try {
            const data = await getVersions(plugin);
            setVersions(data);
        } catch (error) {
            console.error(error);
            setVersions([]);
        } finally {
            setVersionsLoading(false);
        }
    };

    return (
        <>
            <Modal
                visible={versionsOpen}
                onDismissed={() => setVersionsOpen(false)}
                dismissable={!versionsLoading && !isWorking}
                showSpinnerOverlay={versionsLoading || isWorking}
            >
                <h2 css={tw`text-xl font-semibold text-gray-100`}>{plugin.name} versions</h2>
                <p css={tw`text-xs text-gray-300 mt-1`}>Install a specific release directly from your panel.</p>

                <div className={styles.versionList}>
                    {versions.length === 0 && !versionsLoading && (
                        <div className={styles.empty}>No versions were returned for this plugin.</div>
                    )}
                    {versions.map((version) => (
                        <div className={styles.versionRow} key={`${plugin.id}_${version.id}`}>
                            <div>
                                <p css={tw`text-sm font-medium text-gray-100`}>{version.name}</p>
                                <p css={tw`text-xs text-gray-400`}>{version.downloads.toLocaleString()} downloads</p>
                            </div>
                            <Button
                                type={'button'}
                                disabled={isWorking}
                                onClick={() => {
                                    installVersion(version);
                                }}
                                css={tw`px-3 py-2 text-xs`}
                            >
                                Install
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>

            <article className={styles.card}>
                <div className={styles.cardHeader}>
                    <img className={styles.cardIcon} src={plugin.icon || '/assets/pterodactyl.svg'} alt={plugin.name} />
                    <div css={tw`min-w-0 flex-1`}>
                        <h3 className={styles.cardName}>{plugin.name}</h3>
                        <p className={styles.cardSummary}>{plugin.summary || 'No summary provided.'}</p>
                    </div>
                </div>

                <div className={styles.tagRow}>
                    <span className={`${styles.tag} ${sourceColorClass(plugin.source)}`}>{sourceLabel(plugin.source)}</span>
                    <span className={`${styles.tag} ${isCompatible ? styles.tagSuccess : styles.tagWarn}`}>
                        {isCompatible ? 'Compatible' : 'Check version'}
                    </span>
                    {isInstalled && <span className={`${styles.tag} ${styles.tagInfo}`}>Installed</span>}
                    {hasUpdate && <span className={`${styles.tag} ${styles.tagWarn}`}>Update ready</span>}
                </div>

                <p className={styles.stats}>Downloads: {plugin.downloads.toLocaleString()}</p>

                <div className={styles.actions}>
                    <Button
                        type={'button'}
                        disabled={isWorking}
                        onClick={() => installVersion()}
                        css={tw`col-span-2 py-2 text-xs`}
                    >
                        {isInstalled ? (hasUpdate ? 'Update' : 'Uninstall') : 'Install'}
                    </Button>
                    <Button type={'button'} isSecondary onClick={openMarketplace} css={tw`py-2 text-xs`}>
                        Open
                    </Button>
                    <Button
                        type={'button'}
                        isSecondary
                        onClick={openVersions}
                        css={tw`col-span-3 py-2 text-xs`}
                        disabled={isWorking}
                    >
                        Versions
                    </Button>
                </div>
            </article>
        </>
    );
};
