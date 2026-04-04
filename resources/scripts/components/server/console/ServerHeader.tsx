import React from 'react';
import { ServerContext } from '@/state/server';
import PowerButtons from '@/components/server/console/PowerButtons';
import classNames from 'classnames';

const ServerHeader = () => {
    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const id = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const node = ServerContext.useStoreState((state) => state.server.data?.node);

    const statusColors: Record<string, { dot: string; text: string; border: string }> = {
        offline: { dot: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
        running: { dot: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
        starting: { dot: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        stopping: { dot: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' },
    };

    const serverStatus = status || 'offline';
    const colors = statusColors[serverStatus] || statusColors.offline;

    return (
        <div className={'mb-6 rounded-box bg-gray-800/40 backdrop-blur-md shadow-xl shadow-black/20 p-4 md:p-5'}>
            <div className={'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'}>
                <div>
                    <h1 className={'text-3xl font-bold text-gray-50 mb-2'}>{name || 'Loading...'}</h1>
                    <div className={'flex flex-wrap items-center gap-3'}>
                        <div className={classNames(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-gray-700/50',
                            colors.text,
                            colors.border
                        )}>
                            <div className={classNames('w-2 h-2 rounded-full animate-pulse', colors.dot)} />
                            {serverStatus}
                        </div>

                        {id && (
                            <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400 bg-gray-700/50 border border-gray-600/30 font-mono'}>
                                #{id.substring(0, 8)}
                            </div>
                        )}

                        {node && (
                            <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 bg-gray-700/50 border border-gray-600/30'}>
                                Node: {node}
                            </div>
                        )}
                    </div>
                </div>

                <PowerButtons className={'flex flex-wrap items-center gap-x-2 gap-y-2'} />
            </div>
        </div>
    );
};

export default ServerHeader;
