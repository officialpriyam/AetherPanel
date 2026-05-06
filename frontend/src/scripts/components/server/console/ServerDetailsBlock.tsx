import React, { useMemo, useState } from 'react';
import { ChipIcon, GlobeIcon } from '@heroicons/react/outline';
import { LuSave, LuMemoryStick, LuEye } from "react-icons/lu";
import { PlayIcon, RefreshIcon, StopIcon } from '@heroicons/react/outline';
import { ServerContext } from '@/state/server';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Can from '@/components/elements/Can';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';

const TopCardContainer = styled.div`
    ${tw`rounded-box p-5 border shadow-xl flex flex-wrap lg:flex-nowrap items-center gap-6`};
    background: rgba(17, 24, 39, 0.78);
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
`;

const StatItem = ({ label, usage, limit, icon: Icon, color }: { label: string; usage: string; limit: string | React.ReactNode; icon: any; color?: string }) => (
    <div className={'flex flex-col gap-1 min-w-[140px]'}>
        <div className={'flex items-center gap-2 text-gray-400 mb-1'}>
            <Icon className={classNames('w-3.5 h-3.5', color || 'text-gray-400')} />
            <span className={'text-[9px] uppercase font-black tracking-widest'}>{label}</span>
        </div>
        <div className={'flex items-baseline gap-1.5'}>
            <span className={'text-gray-100 font-mono text-base font-bold leading-none'}>{usage}</span>
            <span className={'text-gray-500 font-mono text-[10px] uppercase font-bold'}>/ {limit}</span>
        </div>
    </div>
);

const ServerDetailsBlock = () => {
    const [ipRevealed, setIpRevealed] = useState(false);
    const [stats, setStats] = useState({ cpu: 0, memory: 0, disk: 0 });
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const allocation = ServerContext.useStoreState((state) => state.server.data!.allocations.find((a: any) => a.isDefault));
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const status = ServerContext.useStoreState((state) => state.status.value);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};

        try {
            values = JSON.parse(data);
        } catch {
            return;
        }

        if (!values || typeof values !== 'object') {
            return;
        }

        setStats({
            cpu: values.cpu_absolute || 0,
            memory: values.memory_bytes || 0,
            disk: values.disk_bytes || 0,
        });
    });

    const onButtonClick = (action: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e.preventDefault();
        e.stopPropagation();
        if (instance) instance.send('set state', action);
    };

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : <>&infin;</>,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : <>&infin;</>,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : <>&infin;</>,
        }),
        [limits]
    );

    const primaryIp = allocation
        ? `${ip(allocation.alias || allocation.ip)}:${allocation.port}`
        : '0.0.0.0:0';

    return (
        <TopCardContainer>
            {/* IP Section */}
            <div className={'flex-shrink-0 w-full lg:w-auto lg:min-w-[200px]'}>
                <div 
                    onClick={() => setIpRevealed(!ipRevealed)}
                    className={classNames(
                        'cursor-pointer transition-all duration-300 rounded-xl px-4 py-3 bg-gray-800/60 border border-gray-600/50 hover:border-gray-400/60 flex items-center justify-center relative group overflow-hidden'
                    )}
                >
                    <p className={classNames(
                        'text-gray-100 font-mono text-base font-bold transition-all duration-500',
                        !ipRevealed && 'blur-[8px] opacity-20 select-none'
                    )}>
                        {primaryIp}
                    </p>
                    {!ipRevealed && (
                        <div className={'absolute inset-0 flex items-center justify-center'}>
                            <LuEye className={'w-4 h-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity'} />
                            <span className={'ml-2 text-[10px] text-gray-400 font-bold uppercase group-hover:hidden'}>Reveal IP</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className={'hidden lg:block w-px h-10 bg-gray-600/30'} />

            {/* Stats Section */}
            <div className={'flex flex-wrap items-center gap-8 flex-grow'}>
                <StatItem 
                    label={'CPU'} 
                    usage={`${stats.cpu.toFixed(2)}%`} 
                    limit={textLimits.cpu} 
                    icon={ChipIcon} 
                    color={'text-cyan-400'}
                />
                <StatItem 
                    label={'Memory'} 
                    usage={bytesToString(stats.memory)} 
                    limit={textLimits.memory} 
                    icon={LuMemoryStick} 
                    color={'text-blue-400'}
                />
                <StatItem 
                    label={'Disk'} 
                    usage={bytesToString(stats.disk)} 
                    limit={textLimits.disk} 
                    icon={LuSave} 
                    color={'text-amber-400'}
                />
            </div>

            {/* Divider */}
            <div className={'hidden lg:block w-px h-10 bg-gray-600/30'} />

            {/* Power Buttons */}
            <div className={'flex items-center gap-3'}>
                <Can action={'control.start'}>
                    <button
                        disabled={status !== 'offline'}
                        onClick={onButtonClick.bind(this, 'start')}
                        className={'p-2.5 rounded-lg bg-gray-800 border border-gray-600 hover:border-green-500/50 hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group'}
                        title={'Start'}
                    >
                        <PlayIcon className={'w-5 h-5'} />
                    </button>
                </Can>
                <Can action={'control.restart'}>
                    <button
                        disabled={!status || status === 'offline'}
                        onClick={onButtonClick.bind(this, 'restart')}
                        className={'p-2.5 rounded-lg bg-gray-800 border border-gray-600 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group'}
                        title={'Restart'}
                    >
                        <RefreshIcon className={'w-5 h-5'} />
                    </button>
                </Can>
                <Can action={'control.stop'}>
                    <button
                        disabled={status === 'offline'}
                        onClick={onButtonClick.bind(this, 'stop')}
                        className={'p-2.5 rounded-lg bg-gray-800 border border-gray-600 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group'}
                        title={'Stop'}
                    >
                        <StopIcon className={'w-5 h-5'} />
                    </button>
                </Can>
            </div>
        </TopCardContainer>
    );
};

export default ServerDetailsBlock;
