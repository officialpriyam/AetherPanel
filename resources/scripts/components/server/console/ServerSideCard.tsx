import React, { useEffect, useState } from 'react';
import { GlobeIcon, ChipIcon, CloudDownloadIcon, CloudUploadIcon } from '@heroicons/react/outline';
import { LuMemoryStick, LuHardDrive, LuClock, LuWifi } from 'react-icons/lu';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'tx' | 'rx' | 'uptime', number>;

const ServerSideCard = () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, tx: 0, rx: 0, uptime: 0 });

    const limits = ServerContext.useStoreState((state) => state.server.data?.limits || { cpu: 0, memory: 0, disk: 0 });
    const allocation = ServerContext.useStoreState((state) => state.server.data?.allocations.find((a: any) => a.isDefault));
    const status = ServerContext.useStoreState((state) => state.status.value);

    const primaryIp = allocation
        ? `${ip(allocation.alias || allocation.ip)}:${allocation.port}`
        : '0.0.0.0:0';

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        if (!values || typeof values !== 'object') return;
        setStats({
            memory: values.memory_bytes || 0,
            cpu: values.cpu_absolute || 0,
            disk: values.disk_bytes || 0,
            tx: values.network?.tx_bytes || 0,
            rx: values.network?.rx_bytes || 0,
            uptime: values.uptime || 0,
        });
    });

    const formatUptime = (ms: number) => {
        if (ms <= 0) return 'N/A';
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Section 1: Network */}
            <div className={'bg-gray-700 rounded-box p-5'}>
                <div className={'flex items-center gap-2 text-gray-400 mb-4'}>
                    <GlobeIcon className={'w-4 h-4 text-flash'} />
                    <span className={'text-xs font-bold uppercase tracking-wider'}>Network</span>
                </div>
                <div className={'text-sm text-gray-400 mb-2'}>Server Address</div>
                <CopyOnClick text={primaryIp}>
                    <div className={'bg-gray-800/60 rounded-lg px-4 py-2.5 text-gray-100 font-mono text-sm font-medium cursor-pointer hover:bg-gray-600/50 transition-colors truncate'}>
                        {primaryIp}
                    </div>
                </CopyOnClick>
                <div className={'grid grid-cols-2 gap-4 mt-4'}>
                    <div>
                        <div className={'flex items-center gap-1.5 text-gray-500 mb-1'}>
                            <LuClock className={'w-3 h-3'} />
                            <span className={'text-[10px] uppercase font-bold tracking-wider'}>Server Uptime</span>
                        </div>
                        <p className={'text-gray-100 font-mono text-sm font-bold'}>{formatUptime(stats.uptime)}</p>
                    </div>
                    <div>
                        <div className={'flex items-center gap-1.5 text-gray-500 mb-1'}>
                            <LuWifi className={'w-3 h-3'} />
                            <span className={'text-[10px] uppercase font-bold tracking-wider'}>Server Ping</span>
                        </div>
                        <p className={'text-gray-100 font-mono text-sm font-bold'}>
                            {status === 'running' ? '< 200ms' : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Resources */}
            <div className={'bg-gray-700 rounded-box p-5'}>
                <div className={'flex items-center gap-2 text-gray-400 mb-4'}>
                    <ChipIcon className={'w-4 h-4 text-cyan-400'} />
                    <span className={'text-xs font-bold uppercase tracking-wider'}>Resources</span>
                </div>
                <div className={'flex flex-col gap-3'}>
                    {/* CPU */}
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center gap-2'}>
                            <ChipIcon className={'w-3.5 h-3.5 text-gray-500'} />
                            <span className={'text-sm text-gray-300'}>CPU</span>
                        </div>
                        <div className={'text-right'}>
                            <span className={'text-gray-100 font-mono text-sm font-bold'}>{stats.cpu.toFixed(1)}%</span>
                            <div className={'text-[10px] text-gray-500 font-medium'}>
                                Limit: {limits.cpu ? `${limits.cpu}%` : 'Unlimited'}
                            </div>
                        </div>
                    </div>
                    {/* Memory */}
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center gap-2'}>
                            <LuMemoryStick className={'w-3.5 h-3.5 text-gray-500'} />
                            <span className={'text-sm text-gray-300'}>Memory</span>
                        </div>
                        <div className={'text-right'}>
                            <span className={'text-gray-100 font-mono text-sm font-bold'}>{bytesToString(stats.memory)}</span>
                            <div className={'text-[10px] text-gray-500 font-medium'}>
                                Limit: {limits.memory ? bytesToString(mbToBytes(limits.memory)) : 'Unlimited'}
                            </div>
                        </div>
                    </div>
                    {/* Disk */}
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center gap-2'}>
                            <LuHardDrive className={'w-3.5 h-3.5 text-gray-500'} />
                            <span className={'text-sm text-gray-300'}>Disk</span>
                        </div>
                        <div className={'text-right'}>
                            <span className={'text-gray-100 font-mono text-sm font-bold'}>{bytesToString(stats.disk)}</span>
                            <div className={'text-[10px] text-gray-500 font-medium'}>
                                Limit: {limits.disk ? bytesToString(mbToBytes(limits.disk)) : 'Unlimited'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Network Usage */}
            <div className={'bg-gray-700 rounded-box p-5'}>
                <div className={'flex items-center gap-2 text-gray-400 mb-4'}>
                    <GlobeIcon className={'w-4 h-4 text-emerald-400'} />
                    <span className={'text-xs font-bold uppercase tracking-wider'}>Network</span>
                    <span className={'text-[10px] text-gray-500 ml-auto'}>N/A</span>
                </div>
                <div className={'flex flex-col gap-3'}>
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center gap-2'}>
                            <CloudDownloadIcon className={'w-3.5 h-3.5 text-gray-500'} />
                            <span className={'text-sm text-gray-300'}>Inbound</span>
                        </div>
                        <span className={'text-gray-100 font-mono text-sm font-bold'}>{bytesToString(stats.rx)}</span>
                    </div>
                    <div className={'flex items-center justify-between'}>
                        <div className={'flex items-center gap-2'}>
                            <CloudUploadIcon className={'w-3.5 h-3.5 text-gray-500'} />
                            <span className={'text-sm text-gray-300'}>Outbound</span>
                        </div>
                        <span className={'text-gray-100 font-mono text-sm font-bold'}>{bytesToString(stats.tx)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerSideCard;
