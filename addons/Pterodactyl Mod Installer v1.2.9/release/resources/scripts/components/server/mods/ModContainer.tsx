import http from '@/api/http';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { style } from '@/components/ModInstallerConfig';
import Modal from '@/components/elements/Modal';
import sanitize from 'sanitize-html';
import sanitizeHtml from 'sanitize-html';
import { Mod, ModFile } from './types';
import loadDirectory from '@/api/server/files/loadDirectory';
import deleteFiles from '@/api/server/files/deleteFiles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import getModFiles from '@/api/server/mods/getModFiles';
import VersionContainer from './VersionContainer';
import { Dialog } from '@/components/elements/dialog';
import getMod from '@/api/server/mods/getMod';

interface Props {
    mod: Mod;
    gameVersion: string;
}

export default ({ mod, gameVersion }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const [installed, setInstalled] = useState(false);

    const [installedName, setInstalledName] = useState('');

    const [details, setDetails] = useState(false);

    const [showVersions, setShowVersions] = useState(false);

    const [versions, setVersions] = useState<ModFile[]>();

    const [detailsHTML, setDetailsHTML] = useState('');

    const [noDownload, setNoDownload] = useState(false);

    const [askInstallDependencies, setAskInstallDependencies] = useState(false);

    const [depsToInstall, setDepsToInstall] = useState<Mod[]>([]);

    /**
     * Downloads the mod
     * @returns Nothing
     */
    async function downloadMod(mod: Mod, downloadDependencies = true) {
        if (installed && downloadDependencies) {
            deleteFiles(uuid, '/mods', [installedName]);
            setInstalled(false);
            return;
        }

        //Gets the files
        const files = gameVersion ? await getModFiles(mod.id, gameVersion) : await getModFiles(mod.id);

        //If no files (only possible on specific versions)
        if (files.length === 0) {
            setNoDownload(true);
            return;
        }

        //If the mod has any dependencies
        if (downloadDependencies && files[0].dependencies.length > 0) {
            const mods: Mod[] = [];
            for (let i = 0; i < files[0].dependencies.length; i++) {
                mods.push(await getMod(files[0].dependencies[i].modId));
            }
            setDepsToInstall(mods);
            setAskInstallDependencies(true);
        }

        console.log(files[0].downloadUrl);

        let downloadUrl = files[0].downloadUrl;

        downloadUrl = downloadUrl.replace(' ', '%2B');

        downloadUrl = downloadUrl.replace('edge', 'mediafilez');

        http.post(`/api/client/servers/${uuid}/files/pull`, {
            url: downloadUrl,
            directory: 'mods/',
            filename: `${mod.slug}-C${mod.id}-${files[0].id}.jar`,
        });

        if (downloadDependencies) {
            setInstalledName(`${mod.slug}-C${mod.id}-${files[0].id}.jar`);
        }
        setInstalled(true);

        return;
    }

    /**
     * Checks if the mod is installed and changes color if it is
     */
    async function checkInstalled() {
        const mods = await loadDirectory(uuid, 'mods/');

        for (let i = 0; i < mods.length; i++) {
            if (mods[i].name.includes(mod.slug)) {
                setInstalled(true);
                setInstalledName(mods[i].name);
            }
        }
    }

    /**
     * Loads the HTML details of the mod
     */
    async function getDetails() {
        const url = `https://modinstaller.fyrehost.net/v1/mods/${mod.id}/description`;

        const data = await http.get(url, { withCredentials: false, headers: { Accept: 'application/json' } });

        setDetailsHTML(data.data.data);
    }

    /**
     * Loads the versions of the mod
     */
    async function loadVersions() {
        setVersions(gameVersion ? await getModFiles(mod.id, gameVersion) : await getModFiles(mod.id));
    }

    /**
     * Converts the number to a easily readable string format
     * @param value The number to stringify
     * @returns The string version of the number
     */
    function intToString(value: number): string {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor(('' + value).length / 3);
        let shortValue: number | string = parseFloat(
            (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(2)
        );
        if (shortValue % 1 !== 0) {
            shortValue = shortValue.toFixed(1);
        }
        return shortValue + suffixes[suffixNum];
    }

    useEffect(() => {
        checkInstalled();
        getDetails();
        loadVersions();
    }, []);

    return (
        <>
            <Dialog.Confirm
                open={askInstallDependencies}
                onClose={() => {
                    setAskInstallDependencies(false);
                }}
                onConfirmed={() => {
                    depsToInstall?.forEach((m) => {
                        downloadMod(m, false);
                    });
                    setAskInstallDependencies(false);
                }}
                title='Install Dependencies'
                confirm='Install'
            >
                {depsToInstall.length > 0 ? (
                    depsToInstall.map((mod) => (
                        <div css={tw`flex my-2 bg-neutral-500 rounded-md`} key={Math.random()}>
                            <kbd css={tw`ml-2`}>{mod.name}</kbd>
                            <button
                                css={tw`ml-auto mr-2`}
                                onClick={() => {
                                    if (depsToInstall.length === 1) {
                                        setAskInstallDependencies(false);
                                        return;
                                    }
                                    setDepsToInstall(
                                        depsToInstall.filter((m) => {
                                            return m.id !== mod.id;
                                        })
                                    );
                                }}
                            >
                                <FontAwesomeIcon icon={faMinusCircle} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No dependencies</p>
                )}
            </Dialog.Confirm>
            <Modal
                visible={noDownload}
                dismissable
                onDismissed={() => {
                    setNoDownload(false);
                }}
            >
                <div css={tw`text-center`}>There is no available for the selected Minecraft version.</div>
            </Modal>
            <Modal
                dismissable
                visible={details}
                onDismissed={() => {
                    setDetails(false);
                }}
            >
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitize(detailsHTML, {
                            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                                'img',
                                'b',
                                'a',
                                'ul',
                                'iframe',
                                'li',
                                'blockquote',
                            ]),
                            allowedAttributes: {
                                '*': ['href', 'style', 'target', 'width', 'height', 'src', 'data-url'],
                            },
                            allowedIframeHostnames: ['www.youtube.com'],
                        }),
                    }}
                ></div>
            </Modal>
            <Modal
                dismissable
                visible={showVersions}
                onDismissed={() => {
                    setShowVersions(false);
                }}
            >
                <div css={tw`text-center text-2xl`}>{mod.name}&nbsp;Versions</div>
                <div css={tw`mt-4 mx-10 grid gap-4`}>
                    {versions?.map((version) => (
                        <VersionContainer key={Math.random()} file={version} setInstalled={setInstalled} />
                    ))}
                </div>
            </Modal>
            <div
                style={{ backgroundColor: style.primaryColor, borderColor: style.secondaryColor }}
                css={style.entryStyle}
            >
                <div css={tw`rounded-lg bg-transparent p-2`}>
                    <button
                        onClick={() => {
                            setDetails(true);
                        }}
                        css={tw`flex w-full mx-auto`}
                    >
                        <img
                            css={tw`w-32 h-32 p-2 hidden xl:block`}
                            src={
                                mod.logo !== null
                                    ? mod.logo.url
                                    : 'https://www.curseforge.com/Content/2-0-8233-30833/Skins/Elerium/images/icons/avatar-flame.png'
                            }
                        ></img>
                        <div css={tw`mx-auto`}>
                            <span css={tw`inline`}>
                                <div css={tw`text-2xl mx-auto text-center`}>{mod.name}</div>
                                <div css={tw`flex text-neutral-400 mx-auto`}>
                                    <div css={tw`flex mx-auto`}>
                                        <FontAwesomeIcon icon={faDownload} /> &nbsp;
                                        {intToString(mod.downloadCount)}
                                    </div>
                                </div>
                            </span>
                            <p css={tw`text-center`}>{mod.summary}</p>
                        </div>
                    </button>

                    <div css={tw`flex`}>
                        <button
                            css={installed ? style.buttonUninstall : style.buttonInstall}
                            onClick={() => {
                                downloadMod(mod);
                            }}
                        >
                            {installed ? 'Uninstall' : 'Install'}
                        </button>
                        <button
                            css={style.openExternal}
                            onClick={() => {
                                window.open(`${mod.links.websiteUrl}`);
                            }}
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                css={tw`h-8 w-8 m-auto`}
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='white'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                />
                            </svg>
                        </button>
                    </div>
                    <button
                        css={style.versionsButton}
                        onClick={() => {
                            setShowVersions(true);
                        }}
                    >
                        Versions
                    </button>
                </div>
            </div>
        </>
    );
};
