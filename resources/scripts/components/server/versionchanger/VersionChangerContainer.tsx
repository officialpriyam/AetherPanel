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

const providerKey = (value?: string | null): string => (value || '').toUpperCase();

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

    const providerMap = useMemo(() => {
        const map = new Map<string, MinecraftVersionProviderType>();
        types.forEach((type) => map.set(providerKey(type.name), type));

        return map;
    }, [types]);

    const activeProvider = useMemo(() => (
        selectedType ? providerMap.get(providerKey(selectedType)) ?? types.find((type) => type.name === selectedType) ?? null : null
    ), [selectedType, providerMap, types]);

    const installedProvider = useMemo(() => {
        if (!installed?.build?.type) {
            return null;
        }

        return providerMap.get(providerKey(installed.build.type)) ?? null;
    }, [installed, providerMap]);

    const visibleVersions = useMemo(() => {
        if (!versions) {
            return [];
        }

        return versions.filter((row) => showSnapshots || row.type !== 'SNAPSHOT');
    }, [versions, showSnapshots]);

    const releaseVersions = useMemo(
        () => (versions || []).filter((row) => row.type !== 'SNAPSHOT').length,
        [versions]
    );

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
                        <div className={styles.heroLayout}>
                            <div className={styles.heroCopy}>
                                <span className={`${addonStyles.brand} ${styles.brand}`}>PriyxStudio Addons</span>
                                <h2 className={`${addonStyles.title} ${styles.title}`}>Minecraft Version Changer</h2>
                                <p className={addonStyles.subtitle}>
                                    Switch Paper, Purpur, Forge, Fabric, or other server builds from one polished control
                                    flow with provider logos, release context, and safer install choices.
                                </p>
                                <div className={styles.heroStats}>
                                    <span className={`${addonStyles.tag} ${styles.tag}`}>Providers: {types.length}</span>
                                    <span className={`${addonStyles.tag} ${styles.tag}`}>Release tracks: {releaseVersions}</span>
                                    <span className={`${addonStyles.tag} ${styles.tag}`}>
                                        {installed?.build ? `Installed: ${installed.build.type}` : 'Install not detected'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.heroPanel}>
                                <div className={styles.heroPanelHeader}>
                                    {installedProvider?.icon ? (
                                        <img src={installedProvider.icon} alt={installedProvider.name} className={styles.providerLogoLarge} />
                                    ) : (
                                        <div className={styles.providerLogoFallbackLarge}>
                                            {installed?.build?.type?.slice(0, 2) ?? 'MC'}
                                        </div>
                                    )}
                                    <div>
                                        <p className={styles.kicker}>Current install</p>
                                        <h3>{installed?.build?.versionId ?? installed?.build?.projectVersionId ?? 'Unknown build'}</h3>
                                    </div>
                                </div>
                                <div className={styles.heroPanelMeta}>
                                    <div>
                                        <span>Provider</span>
                                        <strong>{installed?.build?.type ?? 'Not detected'}</strong>
                                    </div>
                                    <div>
                                        <span>Latest known build</span>
                                        <strong>{installed?.latest ? buildLabel(installed.latest) : 'Unknown'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <section className={styles.summaryStrip}>
                        <article className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Current channel</span>
                            <strong className={styles.summaryValue}>
                                {installed?.build?.type ?? 'Unknown'}
                            </strong>
                            <p className={styles.summaryCopy}>
                                {installed?.build
                                    ? `Build ${buildLabel(installed.build)} on ${installed.build.versionId ?? installed.build.projectVersionId ?? 'unknown version'}`
                                    : 'No installed build could be detected from the running server jar yet.'}
                            </p>
                        </article>

                        <article className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Provider focus</span>
                            <strong className={styles.summaryValue}>
                                {activeProvider?.name ?? 'Choose a provider'}
                            </strong>
                            <p className={styles.summaryCopy}>
                                {activeProvider?.description || 'Pick a provider card below to browse versions, builds, and release channels.'}
                            </p>
                        </article>

                        <article className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Snapshots</span>
                            <strong className={styles.summaryValue}>{showSnapshots ? 'Visible' : 'Hidden'}</strong>
                            <p className={styles.summaryCopy}>
                                Keep this off for stable browsing, or enable it when you want preview builds in the list.
                            </p>
                        </article>
                    </section>

                    <section className={addonStyles.cardGrid}>
                        {!selectedType ? (
                            <>
                                {types.map((type) => (
                                    <article
                                        key={type.name}
                                        className={`${addonStyles.card} ${styles.card} ${styles.providerCard}`}
                                        css={tw`cursor-pointer`}
                                        onClick={() => setSelectedType(type.name)}
                                    >
                                        <div className={`${addonStyles.cardHeader} ${styles.providerHeader}`}>
                                            {type.icon ? (
                                                <img src={type.icon} alt={type.name} className={`${addonStyles.cardIcon} ${styles.providerLogo}`} />
                                            ) : (
                                                <div className={styles.providerLogoFallback}>{type.name.slice(0, 2)}</div>
                                            )}
                                            <div className={styles.providerHeaderCopy}>
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

                                        <div className={styles.providerFooter}>
                                            <span className={styles.providerLink}>{type.homepage || 'Catalog endpoint available'}</span>
                                            <Button type={'button'} size={'xsmall'} className={styles.primaryAction}>
                                                Browse Versions
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </>
                        ) : (
                            <>
                                <article className={`${addonStyles.card} ${styles.card} ${styles.selectedProviderCard}`}>
                                    <div className={styles.selectedProviderHeader}>
                                        <div className={styles.selectedProviderIdentity}>
                                            {activeProvider?.icon ? (
                                                <img src={activeProvider.icon} alt={activeProvider.name} className={styles.providerLogoLarge} />
                                            ) : (
                                                <div className={styles.providerLogoFallbackLarge}>
                                                    {selectedType.slice(0, 2)}
                                                </div>
                                            )}
                                            <div>
                                                <p className={styles.kicker}>Active provider</p>
                                                <h3 className={styles.selectedProviderTitle}>{selectedType}</h3>
                                                <p className={styles.selectedProviderCopy}>
                                                    {activeProvider?.description || 'Select a version below, then pick the build you want to install.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={styles.selectedProviderActions}>
                                            <Button
                                                type={'button'}
                                                isSecondary
                                                size={'xsmall'}
                                                onClick={() => setSelectedType(null)}
                                                className={styles.secondaryAction}
                                            >
                                                Back to Providers
                                            </Button>
                                        </div>
                                    </div>

                                    <div className={styles.selectedProviderMeta}>
                                        <label className={styles.snapshotToggle}>
                                            <input
                                                type={'checkbox'}
                                                checked={showSnapshots}
                                                onChange={(e) => setShowSnapshots(e.currentTarget.checked)}
                                            />
                                            <span>Show snapshot tracks</span>
                                        </label>
                                        <div className={styles.selectedProviderStats}>
                                            <span>{visibleVersions.length} visible versions</span>
                                            <span>{versions?.length || 0} total tracks</span>
                                        </div>
                                    </div>
                                </article>

                                {versionRowsLoading || !versions ? (
                                    <div css={tw`col-span-full`}>
                                        <Spinner centered size={'large'} />
                                    </div>
                                ) : (
                                    visibleVersions.map((row) => (
                                        <article key={`${row.version}_${row.latest.id}`} className={`${addonStyles.card} ${styles.card} ${styles.versionCard}`}>
                                            <div className={styles.versionCardTop}>
                                                <div>
                                                    <p className={styles.kicker}>{row.type || 'Release Channel'}</p>
                                                    <h3 className={styles.versionTitle}>{row.version}</h3>
                                                    <p className={styles.versionCopy}>
                                                        {row.builds} builds available for this Minecraft release.
                                                    </p>
                                                </div>
                                                <span className={`${addonStyles.tag} ${styles.tag}`}>Latest: {buildLabel(row.latest)}</span>
                                            </div>

                                            <div className={addonStyles.tagRow}>
                                                <span className={`${addonStyles.tag} ${styles.tag}`}>Builds: {row.builds}</span>
                                                {row.latest.experimental && (
                                                    <span className={`${addonStyles.tag} ${styles.tag} ${styles.tagWarn}`}>Experimental latest</span>
                                                )}
                                            </div>

                                            <div className={styles.versionCardFooter}>
                                                <Button
                                                    type={'button'}
                                                    size={'xsmall'}
                                                    onClick={() => setSelectedVersion(row)}
                                                    className={styles.primaryAction}
                                                >
                                                    Open Builds
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
                <div className={styles.installModal}>
                    <div className={styles.installModalHeader}>
                        {activeProvider?.icon ? (
                            <img src={activeProvider.icon} alt={activeProvider.name} className={styles.providerLogoLarge} />
                        ) : (
                            <div className={styles.providerLogoFallbackLarge}>{selectedType?.slice(0, 2) || 'MC'}</div>
                        )}
                        <div>
                            <p className={styles.kicker}>Install target</p>
                            <h2 className={styles.installTitle}>
                                {selectedType} {selectedVersion?.version}
                            </h2>
                            <p className={styles.installCopy}>
                                Choose the exact build below and decide if this install should clear current files first.
                            </p>
                        </div>
                    </div>

                    {!versionBuilds ? (
                        <div css={tw`py-8`}>
                            <Spinner centered size={'large'} />
                        </div>
                    ) : (
                        <div className={styles.installBody}>
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

                            <label className={styles.installToggle}>
                                <input
                                    type={'checkbox'}
                                    checked={deleteFiles}
                                    onChange={(e) => setDeleteFiles(e.currentTarget.checked)}
                                />
                                <span>Remove all existing server files before installing this version.</span>
                            </label>

                            <div className={styles.installActions}>
                                <Button
                                    type={'button'}
                                    disabled={!selectedBuild || submitting}
                                    onClick={onInstall}
                                    className={styles.primaryAction}
                                >
                                    {submitting ? 'Installing...' : 'Install Version'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </ServerContentBlock>
    );
};
