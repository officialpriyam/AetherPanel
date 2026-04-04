import React, { useEffect, useRef, useState } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import loadDirectory from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { LuDownload, LuFilePlus } from "react-icons/lu";
import { FolderOpenIcon, ArrowNarrowDownIcon, SearchIcon } from '@heroicons/react/outline';
import { Formik } from 'formik';
import Field from '@/components/elements/Field';
import { hashToPath } from '@/helpers';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import pullFileFromUrl from '@/api/server/files/pullFileFromUrl';
import Modal from '@/components/elements/Modal';
import Input from '@/components/elements/Input';
import useFlash, { useFlashKey } from '@/plugins/useFlash';

interface SortButtonProps {
    label: string;
    filterType: string;
    onClick: () => void;
  }
  
const SortButton: React.FC<SortButtonProps> = ({ label, filterType, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-x-1 text-sm text-gray-300 ${filterType === label ? '!text-gray-200' : filterType === `${label}-reversed` ? '!text-gray-200' : ''}`}>
        {label}
        <div className={`${filterType === label ? '' : filterType === `${label}-reversed` ? 'rotate-180' : 'opacity-50'}`}>
            <ArrowNarrowDownIcon className={'w-3'} />
        </div>
    </button>
);

export default () => {
    const { t } = useTranslation('flash/server/files');
    const [filterType, setFilterType] = useState('name');
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addFlash } = useFlash();
    const { clearAndAddHttpError, clearFlashes: clearFileFlashes, addError } = useFlashKey('files');

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredFiles, setFilteredFiles] = useState<FileObject[]>([]);

    const [pullOpen, setPullOpen] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [pullUrl, setPullUrl] = useState('');
    const [pullName, setPullName] = useState('');
    const [pullProgress, setPullProgress] = useState<number | null>(null);
    const [pullExpectedSize, setPullExpectedSize] = useState<number | null>(null);
    const [pullTargetName, setPullTargetName] = useState<string | null>(null);
    const [activePullId, setActivePullId] = useState<string | null>(null);
    const pullStableRef = useRef(0);
    const pullLastSize = useRef(0);

    type PullStatus = 'downloading' | 'done' | 'error';
    type PullJob = {
        id: string;
        url: string;
        name: string;
        status: PullStatus;
        progress: number;
        startedAt: number;
    };
    const [pullJobs, setPullJobs] = useState<PullJob[]>([]);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);
    const sortFiles = (files: FileObject[], filterType: string): FileObject[] => {
        const commonSort = (filesToSort: FileObject[]) =>
            filesToSort.sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    
        let sortedFiles: FileObject[];
    
        switch (filterType) {
            case 'name':
            case 'name-reversed':
                sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
            case 'size-reversed':
                sortedFiles = files.sort((a, b) => a.size - b.size);
                break;
            case 'date':
            case 'date-reversed':
                sortedFiles = files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
                break;
            default:
                sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    
        if (filterType.endsWith('-reversed')) {
            sortedFiles.reverse();
        }
    
        return commonSort(sortedFiles).filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
    };
    
    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    useEffect(() => {
        // Filter files based on the search term
        const filtered = files?.filter(
            (file) =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        setFilteredFiles(filtered || []);
    }, [files, searchTerm]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    const guessFilename = (value: string) => {
        try {
            const parsed = new URL(value);
            const segment = parsed.pathname.split('/').filter(Boolean).pop();
            return decodeURIComponent(segment || '') || 'download.bin';
        } catch {
            const fallback = value.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
            return decodeURIComponent(fallback || '') || 'download.bin';
        }
    };

    const fetchRemoteInfo = async (value: string) => {
        try {
            const response = await fetch(value, { method: 'HEAD' });
            if (!response.ok) {
                return { size: null, name: null };
            }
            const length = response.headers.get('content-length');
            const disposition = response.headers.get('content-disposition') || '';
            const match = disposition.match(/filename\*?=(?:UTF-8''|\"?)([^\";]+)/i);
            const headerName = match ? decodeURIComponent(match[1]) : null;
            return {
                size: length ? Number(length) : null,
                name: headerName,
            };
        } catch {
            return { size: null, name: null };
        }
    };

    const onUrlBlur = async () => {
        if (pullName.trim() || !pullUrl.trim()) {
            return;
        }
        const info = await fetchRemoteInfo(pullUrl.trim());
        if (info.name) {
            setPullName(info.name);
        }
    };

    const resetPullState = () => {
        setPullUrl('');
        setPullName('');
        setPullProgress(null);
        setPullExpectedSize(null);
        setPullTargetName(null);
        setActivePullId(null);
        pullStableRef.current = 0;
        pullLastSize.current = 0;
    };

    const finishPull = () => {
        setPullProgress(100);
        setPulling(false);
        setPullOpen(false);
        mutate();
        if (activePullId) {
            setPullJobs((prev) =>
                prev.map((job) => (job.id === activePullId ? { ...job, status: 'done', progress: 100 } : job))
            );
        }
        addFlash({ key: 'files', type: 'success', message: 'File pull completed successfully.' });
        window.setTimeout(() => {
            resetPullState();
        }, 500);
    };

    useEffect(() => {
        if (!pulling || !pullTargetName) {
            return;
        }

        let cancelled = false;

        const tick = async () => {
            try {
                const list = await loadDirectory(uuid, directory);
                const match = list.find((entry) => entry.name === pullTargetName);
                if (!match) {
                    if (!pullExpectedSize && pullProgress !== null) {
                        setPullProgress((prev) => Math.min(95, (prev ?? 0) + 6));
                    }
                    return;
                }

                if (pullExpectedSize) {
                    const pct = Math.min(100, Math.round((match.size / pullExpectedSize) * 100));
                    setPullProgress(pct);
                    if (activePullId) {
                        setPullJobs((prev) =>
                            prev.map((job) => (job.id === activePullId ? { ...job, progress: pct } : job))
                        );
                    }
                    if (pct >= 100) {
                        finishPull();
                    }
                    return;
                }

                if (match.size === pullLastSize.current && match.size > 0) {
                    pullStableRef.current += 1;
                } else {
                    pullStableRef.current = 0;
                }

                pullLastSize.current = match.size;
                setPullProgress((prev) => Math.min(98, Math.max(prev ?? 0, 30)));
                if (activePullId) {
                    setPullJobs((prev) =>
                        prev.map((job) =>
                            job.id === activePullId
                                ? { ...job, progress: Math.min(98, Math.max(job.progress, 30)) }
                                : job
                        )
                    );
                }

                if (pullStableRef.current >= 2 && match.size > 0) {
                    finishPull();
                }
            } catch {
                // Ignore polling errors.
            }
        };

        const timer = window.setInterval(() => {
            if (!cancelled) {
                tick();
            }
        }, 2000);

        tick();

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [pulling, pullTargetName, pullExpectedSize, directory, uuid]);

    const onStartPull = async (event: React.FormEvent) => {
        event.preventDefault();
        const url = pullUrl.trim();
        if (!url) {
            addError('Please enter a file URL to pull.');
            return;
        }

        clearFileFlashes();
        setPulling(true);
        setPullProgress(5);

        const info = await fetchRemoteInfo(url);
        const derivedName = pullName.trim() || info.name || guessFilename(url);
        const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setActivePullId(jobId);
        setPullJobs((prev) => [
            {
                id: jobId,
                url,
                name: derivedName,
                status: 'downloading',
                progress: 5,
                startedAt: Date.now(),
            },
            ...prev,
        ].slice(0, 6));

        setPullExpectedSize(info.size);
        setPullTargetName(derivedName);

        try {
            await pullFileFromUrl(uuid, url, directory, {
                filename: derivedName,
                useHeader: pullName.trim().length === 0,
            });
            setPullProgress((prev) => Math.max(prev ?? 0, 10));
            setPullJobs((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, progress: Math.max(job.progress, 10) } : job
                )
            );
        } catch (pullError) {
            setPulling(false);
            setPullProgress(null);
            setPullJobs((prev) =>
                prev.map((job) => (job.id === jobId ? { ...job, status: 'error', progress: 0 } : job))
            );
            clearAndAddHttpError(pullError);
        }
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    function filterFiles( value: string ){
        if(value == filterType){
            setFilterType(value + '-reversed');
        } else {
            setFilterType(value);
        }
    }

    return (
        <ServerContentBlock title={t('file-manager')} showFlashKey={'files'} icon={FolderOpenIcon}>
            <div className={'bg-gray-700 backdrop rounded-box py-5 px-2 mb-4'}>
                <ErrorBoundary>
                    <div className={'flex flex-wrap-reverse md:flex-nowrap'}>
                        <FileManagerBreadcrumbs
                            renderLeft={
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    css={tw`mx-4`}
                                    checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                    onChange={onSelectAllClick}
                                />
                            }
                        />
                        <div className={style.manager_actions}>
                            <div className={'md:w-auto w-full'}>
                                <Formik initialValues={{}} onSubmit={() => {}}>
                                    <Field
                                        type="text"
                                        icon={SearchIcon}
                                        placeholder={t('search')}
                                        name="Search files"
                                        value={searchTerm}
                                        className={'md:max-w-[250px] w-full'}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Formik>
                            </div>
                            <div className={'h-full w-1 bg-gray-600 lg:block hidden'} />
                            <FileManagerStatus />
                            <MassActionsBar />
                            <Can action={'file.create'}>
                                <div className={'h-full w-1 bg-gray-600 lg:block hidden'} />
                                <NewDirectoryButton />
                                <UploadButton />
                                <Tooltip content={'Pull file from URL'}>
                                    <Button className={'h-full'} onClick={() => setPullOpen(true)} disabled={pulling}>
                                        <LuDownload />
                                    </Button>
                                </Tooltip>
                                <Tooltip content={`${t('new-file')}`}>
                                    <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                        <Button className={'h-full'}>
                                            <LuFilePlus />
                                        </Button>
                                    </NavLink>
                                </Tooltip>
                            </Can>
                        </div>
                    </div>
                </ErrorBoundary>
            </div>
            {pulling && !pullOpen && (
                <button
                    type={'button'}
                    onClick={() => setPullOpen(true)}
                    className={'fixed right-6 top-24 z-30 flex items-center gap-2 rounded-full border border-gray-500/70 bg-gray-800/70 px-3 py-2 text-xs text-gray-100 shadow-lg backdrop-blur-md'}
                >
                    <LuDownload className={'animate-spin'} />
                    Downloading...
                </button>
            )}
            {pullJobs.length > 0 && (
                <div className={'bg-gray-700 backdrop rounded-box py-4 px-4 mb-4'}>
                    <div className={'flex items-center justify-between'}>
                        <div>
                            <h3 className={'text-sm font-semibold text-gray-100'}>Download Queue</h3>
                            <p className={'text-xs text-gray-300'}>Recent URL pulls and status.</p>
                        </div>
                    </div>
                    <div className={'mt-3 space-y-3'}>
                        {pullJobs.map((job) => (
                            <div key={job.id} className={'rounded-lg border border-gray-600/60 bg-gray-800/50 p-3'}>
                                <div className={'flex items-center justify-between gap-3'}>
                                    <div>
                                        <p className={'text-sm text-gray-100'}>{job.name}</p>
                                        <p className={'text-xs text-gray-400'}>{job.url}</p>
                                    </div>
                                    <span className={'text-xs text-gray-300'}>
                                        {job.status === 'downloading' && 'Downloading'}
                                        {job.status === 'done' && 'Completed'}
                                        {job.status === 'error' && 'Failed'}
                                    </span>
                                </div>
                                <div className={'mt-2 h-2 rounded-full bg-gray-900/60 overflow-hidden'}>
                                    <div
                                        className={'h-full bg-gray-300/70 transition-all duration-200'}
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className={'bg-gray-700 backdrop rounded-box py-5 px-2'}>
                {!files ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        <div className={'hidden sm:flex px-4 pb-2'}>
                            <div className={'ml-20 flex-1'}>
                                <SortButton label={t('name')} filterType={filterType} onClick={() => filterFiles('name')} />
                            </div>
                            <div className={'w-1/6 mr-4 justify-end flex'}>
                                <SortButton label={t('size')} filterType={filterType} onClick={() => filterFiles('size')} />
                            </div>
                            <div className={'w-1/5 mr-16 justify-end flex'}>
                                <SortButton label={t('date')} filterType={filterType} onClick={() => filterFiles('date')} />
                            </div>
                        </div>

                        {!files.length ? (
                            <p css={tw`text-sm text-neutral-300 text-center`}>{t('is-empty')}</p>
                        ) : (
                            <CSSTransition classNames={'fade'} timeout={150} appear in>
                                <div>
                                    {files.length > 250 && (
                                        <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                            <p css={tw`text-yellow-900 text-sm text-center`}>
                                                {t('is-limited')}
                                            </p>
                                        </div>
                                    )}
                                    {sortFiles(filteredFiles.slice(0, 250), filterType).map(file => (
                                        <FileObjectRow key={file.key} file={file} />
                                    ))}
                                </div>
                            </CSSTransition>
                        )}
                    </>
                )}
            </div>
            <Modal visible={pullOpen} onDismissed={() => setPullOpen(false)} dismissable>
                <form onSubmit={onStartPull} css={tw`space-y-4`}>
                    <div css={tw`flex items-center gap-3`}>
                        <div css={tw`h-10 w-10 rounded-full border border-gray-500/70 bg-gray-800/70 flex items-center justify-center`}>
                            <LuDownload className={'text-gray-100'} />
                        </div>
                        <div>
                            <h2 css={tw`text-lg font-semibold text-gray-100`}>Pull File</h2>
                            <p css={tw`text-xs text-gray-300`}>Download a file directly to this server from a URL.</p>
                        </div>
                    </div>
                    <div css={tw`space-y-3`}>
                        <Input
                            value={pullUrl}
                            onChange={(event) => setPullUrl(event.currentTarget.value)}
                            onBlur={onUrlBlur}
                            placeholder={'https://example.com/file.zip'}
                        />
                        <Input
                            value={pullName}
                            onChange={(event) => setPullName(event.currentTarget.value)}
                            placeholder={'Save as (optional)'}
                        />
                    </div>
                    {pulling && (
                        <div css={tw`space-y-2`}>
                            <div css={tw`flex items-center justify-between text-xs text-gray-300`}>
                                <span>Downloading {pullTargetName || 'file'}</span>
                                <span>{pullProgress ?? 0}%</span>
                            </div>
                            <div css={tw`h-2 rounded-full bg-gray-800/70 overflow-hidden`}>
                                <div
                                    css={tw`h-full bg-gray-300/70 transition-all duration-200`}
                                    style={{ width: `${pullProgress ?? 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div css={tw`flex items-center justify-end gap-2`}>
                        <Button type={'button'} isSecondary onClick={() => setPullOpen(false)}>
                            Cancel
                        </Button>
                        <Button type={'submit'} disabled={pulling || !pullUrl.trim()}>
                            {pulling ? 'Pulling...' : 'Pull File'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </ServerContentBlock>
    );
};
