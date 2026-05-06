import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import { useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import { useLocation, useHistory } from 'react-router-dom';
import Select from '@/components/elements/Select';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation('flash/navigation');
    const { search, pathname } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [ page, setPage ] = useState((!isNaN(defaultPage) && defaultPage > 0) ? defaultPage : 1);
    const uuid = useStoreState(state => state.user.data!.uuid);
    
    const { data: servers } = useSWR<PaginatedResult<Server>>(
        [ '/api/client/servers', page ],
        () => getServers({ page }),
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [ servers?.pagination.currentPage ]);

    const history = useHistory();

    const handleChange = (value: string) => {
        history.push(value)
    }

    const currentPath = pathname.split('/', 3).join('/');
    const hasServers = Boolean(servers && servers.items.length > 0);
    const currentPage = servers?.pagination.currentPage ?? 1;
    const totalPages = servers?.pagination.totalPages ?? 1;

    return (
        <div className={'w-[250px]'}>
            <Select onChange={event => handleChange(event.target.value)} value={currentPath} className={'selection-container'}>
                <option value={`/`} css="display:none;">
                    {t('select-a-server', 'Select a server')}
                </option>
                {!servers && (
                    <option value={currentPath} disabled>
                        {t('loading', 'Loading...')}
                    </option>
                )}
                {hasServers &&
                    servers!.items.map((server) => (
                        <option value={`/server/${server.id}`} key={server.uuid}>
                            {server.name}
                        </option>
                    ))}
                {servers && !hasServers && (
                    <option value={`/`} disabled>
                        {t('no-servers')}
                    </option>
                )}
            </Select>
            {servers && totalPages > 1 && (
                <div className={'mt-2 flex items-center justify-between text-xs text-gray-300'}>
                    <button
                        type={'button'}
                        className={'rounded border border-gray-600 px-2 py-1 disabled:opacity-50'}
                        disabled={currentPage <= 1}
                        onClick={() => setPage(currentPage - 1)}
                    >
                        {t('previous', 'Previous')}
                    </button>
                    <span>
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        type={'button'}
                        className={'rounded border border-gray-600 px-2 py-1 disabled:opacity-50'}
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(currentPage + 1)}
                    >
                        {t('next', 'Next')}
                    </button>
                </div>
            )}
        </div>
    );
};
