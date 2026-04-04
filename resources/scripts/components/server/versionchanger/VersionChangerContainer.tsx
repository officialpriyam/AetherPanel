import getBuildsForVersionForType from '@/api/server/versionchanger/getBuildsForVersionForType';
import getInstalled from '@/api/server/versionchanger/getInstalled';
import getTypes from '@/api/server/versionchanger/getTypes';
import getVersionsForType from '@/api/server/versionchanger/getVersionsForType';
import installVersion from '@/api/server/versionchanger/installVersion';
import { InstalledVersionState, MinecraftVersionBuild, MinecraftVersionBuilds, MinecraftVersionProviderType } from '@/api/server/versionchanger/types';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Modal from '@/components/elements/Modal';
import Select from '@/components/elements/Select';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import addonStyles from '@/components/server/addons-style.module.css';
import styles from '@/components/server/versionchanger/version-changer.module.css';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useState } from 'react';
import tw from 'twin.macro';

const buildLabel = (build: MinecraftVersionBuild): string =>
    build.buildNumber === 1 ? build.projectVersionId ?? String(build.buildNumber) : String(build.buildNumber);

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    const [types, setTypes] = useState<MinecraftVersionProviderType[]>([]);
    const [installed, setInstalled] = useState<InstalledVersionState | null | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [versions, setVersions] = useState<MinecraftVersionBuilds[] | undefined>(undefined);
    const [versionRowsLoading, setVersionRowsLoading] = useState(false);
    const [showSnapshots, setShowSnapshots] = useState(false);

    const [selectedVersion, setSelectedVersion] = useState<MinecraftVersionBuilds | null>(null);
    const [versionBuilds, setVersionBuilds] = useState<MinecraftVersionBuild[] | undefined>(undefined);
    const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);
    const [deleteFiles, setDeleteFiles] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const refreshInstalled = async () => {
        try {
            const data = await getInstalled(uuid);
            setInstalled(data);
        } catch (error) {
            setInstalled(null);
        }
    };

    useEffect(() => {
        clearFlashes('version-changer');

        Promise.all([getTypes(uuid), getInstalled(uuid)])
            .then(([typeRows, installedRow]) => {
                setTypes(typeRows);
                setInstalled(installedRow);
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'version-changer', error });
                setInstalled(null);
            });
    }, [uuid]);

    useEffect(() => {
        if (!selectedType) {
            setVersions(undefined);
            return;
        }

        setVersionRowsLoading(true);
        getVersionsForType(uuid, selectedType)
            .then((rows) => setVersions(rows))
            .catch((error) => clearAndAddHttpError({ key: 'version-changer', error }))
            .finally(() => setVersionRowsLoading(false));
    }, [uuid, selectedType]);

    useEffect(() => {
        if (!selectedVersion || !selectedType) {
            setVersionBuilds(undefined);
            setSelectedBuildId(null);
            return;
        }

        setVersionBuilds(undefined);
        getBuildsForVersionForType(uuid, selectedType, selectedVersion.version)
            .then((rows) => {
                setVersionBuilds(rows);
                setSelectedBuildId(rows.length > 0 ? rows[0].id : null);
            })
            .catch((error) => clearAndAddHttpError({ key: 'version-changer', error }));
    }, [uuid, selectedType, selectedVersion]);

    const selectedBuild = useMemo(
        () => versionBuilds?.find((row) => row.id === selectedBuildId) ?? null,
        [versionBuilds, selectedBuildId]
    );

    const visibleVersions = useMemo(() => {
        if (!versions) {
            return [];
        }

        return versions.filter((row) => showSnapshots || row.type !== 'SNAPSHOT');
    }, [versions, showSnapshots]);

    const onInstall = async () => {
        if (!selectedBuild) {
            return;
        }

        clearFlashes('version-changer');
        setSubmitting(true);

        try {
            await installVersion(uuid, selectedBuild.id, deleteFiles);
            await refreshInstalled();

            if (selectedType) {
                const rows = await getVersionsForType(uuid, selectedType);
                setVersions(rows);
            }

            addFlash({ key: 'version-changer', type: 'success', message: 'Version installation has been queued successfully.' });
            setSelectedVersion(null);
            setDeleteFiles(false);
        } catch (error) {
            clearAndAddHttpError({ key: 'version-changer', error });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ServerContentBlock title={'Version Changer'} icon={SwitchVerticalIcon}>
            <FlashMessageRender byKey={'version-changer'} css={tw`mb-4`} />

            {installed === undefined ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className={`${addonStyles.shell} ${styles.shell}`}>
                    <header className={`${addonStyles.hero} ${styles.hero}`}>
                        <span className={`${addonStyles.brand} ${styles.brand}`}>PriyxStudio Addons</span>
                        <h2 className={addonStyles.title}>Minecraft Version Changer</h2>
                        <p className={addonStyles.subtitle}>
                            Pick a server type and install a different Minecraft build safely from this panel.
                        </p>
                    </header>

                    <section className={addonStyles.controls}>
                        <div css={tw`flex flex-wrap gap-2`}>
                            <span className={`${addonStyles.tag} ${styles.tag}`}>Providers: {types.length}</span>
                            {installed ? (
                                <>
                                    <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagSuccess}`}>
                                        Installed: {installed.build.type}
                                    </span>
                                    <span className={`${addonStyles.tag} ${styles.tag}`}>
                                        Current: {installed.build.versionId ?? installed.build.projectVersionId ?? 'Unknown'}
                                    </span>
                                </>
                            ) : (
                                <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagWarn}`}>
                                    No detected installed build
                                </span>
                            )}
                        </div>
                    </section>

                    <section className={addonStyles.cardGrid}>
                        {!selectedType ? (
                            <>
                                {types.map((type) => (
                                    <article
                                        key={type.name}
                                        className={`${addonStyles.card} ${styles.card}`}
                                        css={tw`cursor-pointer`}
                                        onClick={() => setSelectedType(type.name)}
                                    >
                                        <div className={addonStyles.cardHeader}>
                                            <div css={tw`min-w-0 flex-1`}>
                                                <h3 className={addonStyles.cardName}>{type.name}</h3>
                                                <p className={addonStyles.cardSummary}>{type.description || 'No description available.'}</p>
                                            </div>
                                        </div>
                                        <div className={addonStyles.tagRow}>
                                            <span className={`${addonStyles.tag} ${styles.tag}`}>{type.builds} builds</span>
                                            <span className={`${addonStyles.tag} ${styles.tag}`}>MC versions: {type.versions.minecraft}</span>
                                            {type.experimental && (
                                                <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagWarn}`}>Experimental</span>
                                            )}
                                            {type.deprecated && (
                                                <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagWarn}`}>Deprecated</span>
                                            )}
                                        </div>
                                        <div css={tw`mt-4`}>
                                            <Button type={'button'} size={'xsmall'} className={styles.cardAction}>
                                                Open Versions
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </>
                        ) : (
                            <>
                                <article className={`${addonStyles.card} ${styles.card}`}>
                                    <div css={tw`flex items-center justify-between gap-3`}>
                                        <div>
                                            <h3 className={addonStyles.cardName}>{selectedType} Versions</h3>
                                            <p className={addonStyles.cardSummary}>
                                                Select a version to open available builds and install it.
                                            </p>
                                        </div>
                                        <Button
                                            type={'button'}
                                            isSecondary
                                            size={'xsmall'}
                                            onClick={() => setSelectedType(null)}
                                            className={styles.cardAction}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                    <label css={tw`mt-4 flex items-center gap-2 text-xs text-gray-300`}>
                                        <input
                                            type={'checkbox'}
                                            checked={showSnapshots}
                                            onChange={(e) => setShowSnapshots(e.currentTarget.checked)}
                                        />
                                        Show snapshot versions
                                    </label>
                                </article>

                                {versionRowsLoading || !versions ? (
                                    <div css={tw`col-span-full`}>
                                        <Spinner centered size={'large'} />
                                    </div>
                                ) : (
                                    visibleVersions.map((row) => (
                                        <article key={`${row.version}_${row.latest.id}`} className={`${addonStyles.card} ${styles.card}`}>
                                            <div className={addonStyles.cardHeader}>
                                                <div>
                                                    <h3 className={addonStyles.cardName}>{row.version}</h3>
                                                    <p className={addonStyles.cardSummary}>{row.type || 'Release'} - {row.builds} builds</p>
                                                </div>
                                            </div>
                                            <div className={addonStyles.tagRow}>
                                                <span className={`${addonStyles.tag} ${styles.tag}`}>
                                                    Latest build: {buildLabel(row.latest)}
                                                </span>
                                                {row.latest.experimental && (
                                                    <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagWarn}`}>Experimental</span>
                                                )}
                                            </div>
                                            <div css={tw`mt-4`}>
                                                <Button
                                                    type={'button'}
                                                    size={'xsmall'}
                                                    onClick={() => setSelectedVersion(row)}
                                                    className={styles.cardAction}
                                                >
                                                    Select
                                                </Button>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}

            <Modal
                visible={!!selectedVersion}
                onDismissed={() => !submitting && setSelectedVersion(null)}
                dismissable={!submitting}
                showSpinnerOverlay={submitting}
            >
                <h2 css={tw`text-xl font-semibold text-gray-100`}>
                    Install {selectedType} {selectedVersion?.version}
                </h2>
                <p css={tw`text-xs text-gray-300 mt-1`}>
                    Confirm the target build and choose if server files should be removed first.
                </p>

                {!versionBuilds ? (
                    <div css={tw`py-8`}>
                        <Spinner centered size={'large'} />
                    </div>
                ) : (
                    <div css={tw`mt-4`}>
                        <Select
                            value={selectedBuildId ?? ''}
                            onChange={(e) => setSelectedBuildId(Number(e.currentTarget.value))}
                        >
                            {versionBuilds.map((build) => (
                                <option key={build.id} value={build.id}>
                                    Build {buildLabel(build)} {build.experimental ? '(Experimental)' : '(Stable)'}
                                </option>
                            ))}
                        </Select>

                        <label css={tw`mt-4 flex items-start gap-2 text-xs text-gray-300`}>
                            <input
                                type={'checkbox'}
                                checked={deleteFiles}
                                onChange={(e) => setDeleteFiles(e.currentTarget.checked)}
                            />
                            Remove all server files before installing this version.
                        </label>

                        <div css={tw`mt-5 flex justify-end`}>
                            <Button
                                type={'button'}
                                disabled={!selectedBuild || submitting}
                                onClick={onInstall}
                                className={styles.cardAction}
                            >
                                {submitting ? 'Installing...' : 'Install Version'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </ServerContentBlock>
    );
};
