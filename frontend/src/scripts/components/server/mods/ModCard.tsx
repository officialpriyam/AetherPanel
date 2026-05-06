import getModFiles from '@/api/server/mods/getModFiles';
import downloadFileFromUrl from '@/api/server/files/downloadFileFromUrl';
import deleteFiles from '@/api/server/files/deleteFiles';
import Button from '@/components/elements/Button';
import Modal from '@/components/elements/Modal';
import { Mod, ModFile } from '@/components/server/mods/types';
import styles from '@/components/server/addons-style.module.css';
import useFlash from '@/plugins/useFlash';
import React, { useState } from 'react';
import tw from 'twin.macro';

interface Props {
    mod: Mod;
    uuid: string;
    selectedVersion: string;
    installedFile: string | null;
    onInstalledChange: () => Promise<void>;
}

const normalizeModDownload = (url: string): string => url.replace(/ /g, '%2B').replace('edge', 'mediafilez');

export default ({ mod, uuid, selectedVersion, installedFile, onInstalledChange }: Props) => {
    const { addFlash } = useFlash();

    const [isWorking, setIsWorking] = useState(false);
    const [versionsOpen, setVersionsOpen] = useState(false);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [versions, setVersions] = useState<ModFile[]>([]);

    const isInstalled = !!installedFile;

    const installSpecific = async (targetFile?: ModFile) => {
        setIsWorking(true);

        try {
            if (isInstalled && !targetFile) {
                await deleteFiles(uuid, '/mods', [installedFile!]);
                addFlash({ key: 'mod-installer', type: 'success', message: `${mod.name} removed.` });
                await onInstalledChange();
                return;
            }

            const files = targetFile
                ? [targetFile]
                : await getModFiles(mod.id, selectedVersion === 'Any' ? '' : selectedVersion);

            if (files.length === 0) {
                addFlash({
                    key: 'mod-installer',
                    type: 'error',
                    message: 'No mod files are available for this Minecraft version.',
                });
                return;
            }

            const file = files[0];
            const downloadUrl = normalizeModDownload(file.downloadUrl);
            const fileName = `${mod.slug}-C${mod.id}-${file.id}.jar`;

            if (isInstalled) {
                await deleteFiles(uuid, '/mods', [installedFile!]);
            }

            await downloadFileFromUrl(uuid, downloadUrl, '/mods', fileName);

            addFlash({ key: 'mod-installer', type: 'success', message: `${mod.name} install queued.` });
            await onInstalledChange();
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'mod-installer',
                type: 'error',
                message: `Could not process ${mod.name}. Please try again.`,
            });
        } finally {
            setIsWorking(false);
        }
    };

    const openVersions = async () => {
        setVersionsOpen(true);
        setVersionsLoading(true);

        try {
            const rows = await getModFiles(mod.id, selectedVersion === 'Any' ? '' : selectedVersion);
            setVersions(rows);
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
                <h2 css={tw`text-xl font-semibold text-gray-100`}>{mod.name} versions</h2>
                <p css={tw`text-xs text-gray-300 mt-1`}>Install a specific release from this mod.</p>

                <div className={styles.versionList}>
                    {versions.length === 0 && !versionsLoading && (
                        <div className={styles.empty}>No versions were returned for this filter.</div>
                    )}
                    {versions.map((file) => (
                        <div className={styles.versionRow} key={`${mod.id}_${file.id}`}>
                            <div>
                                <p css={tw`text-sm font-medium text-gray-100`}>{file.displayName}</p>
                                <p css={tw`text-xs text-gray-400`}>{file.downloadCount.toLocaleString()} downloads</p>
                            </div>
                            <Button
                                type={'button'}
                                disabled={isWorking}
                                onClick={() => {
                                    installSpecific(file);
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
                    <img
                        className={styles.cardIcon}
                        src={mod.logo?.thumbnailUrl || mod.logo?.url || '/assets/svgs/ourpanel.svg'}
                        alt={mod.name}
                    />
                    <div css={tw`min-w-0 flex-1`}>
                        <h3 className={styles.cardName}>{mod.name}</h3>
                        <p className={styles.cardSummary}>{mod.summary || 'No summary provided.'}</p>
                    </div>
                </div>

                <div className={styles.tagRow}>
                    <span className={`${styles.tag} ${styles.tagInfo}`}>CurseForge</span>
                    {isInstalled && <span className={`${styles.tag} ${styles.tagSuccess}`}>Installed</span>}
                    {selectedVersion !== 'Any' && <span className={styles.tag}>{selectedVersion}</span>}
                </div>

                <p className={styles.stats}>Downloads: {mod.downloadCount.toLocaleString()}</p>

                <div className={styles.actions}>
                    <Button type={'button'} disabled={isWorking} onClick={() => installSpecific()} css={tw`col-span-2 py-2 text-xs`}>
                        {isInstalled ? 'Uninstall' : 'Install'}
                    </Button>
                    <Button
                        type={'button'}
                        isSecondary
                        onClick={() => {
                            if (mod.links.websiteUrl) {
                                window.open(mod.links.websiteUrl, '_blank', 'noopener,noreferrer');
                            }
                        }}
                        css={tw`py-2 text-xs`}
                    >
                        Open
                    </Button>
                    <Button type={'button'} isSecondary onClick={openVersions} css={tw`col-span-3 py-2 text-xs`}>
                        Versions
                    </Button>
                </div>
            </article>
        </>
    );
};
