import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { hexToRgba } from '@/lib/helpers';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { CloudDownloadIcon, CloudUploadIcon } from '@heroicons/react/solid';
import { theme } from 'twin.macro';
import ChartBlock from '@/components/server/console/ChartBlock';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'rx' | 'tx', number>;

export default () => {
    const { t } = useTranslation('flash/utilities');
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, rx: 0, tx: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data?.limits || { cpu: 0, memory: 0, disk: 0 });
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const cpu = useChartTickLabel('CPU', limits.cpu || 0, '%', 2);
    const memory = useChartTickLabel('Memory', limits.memory || 0, 'MiB');
    const disk = useChartTickLabel('Disk', limits.disk || 0, 'MiB');
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            return {
                ...opts,
                label: !index ? 'Network In' : 'Network Out',
                borderColor: !index ? theme('colors.cyan.400') : theme('colors.yellow.400'),
                backgroundColor: hexToRgba(!index ? theme('colors.cyan.700') : theme('colors.yellow.700'), 0.5),
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            disk.clear();
            network.clear();
        }
    }, [status]);

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
        });

        cpu.push(values.cpu_absolute || 0);
        memory.push(Math.floor((values.memory_bytes || 0) / 1024 / 1024));
        disk.push(Math.floor((values.disk_bytes || 0) / 1024 / 1024));

        if (values.network) {
            network.push([
                previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx),
                previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx),
            ]);
            previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
        }
    });

    return (
        <>
            <ChartBlock title={'CPU Load'} type={'cpu'} limit={limits.cpu ? limits.cpu + '%' : 'Unlimited'} usage={`${stats.cpu.toFixed(2)}%`}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'} type={'memory'} limit={limits.memory ? bytesToString(mbToBytes(limits.memory)) : 'Unlimited'} usage={bytesToString(stats.memory)}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock title={'Disk'} type={'disk'} limit={limits.disk ? bytesToString(mbToBytes(limits.disk)) : 'Unlimited'} usage={bytesToString(stats.disk)}>
                <Line {...disk.props} />
            </ChartBlock>
            <ChartBlock
                type={'network'}
                title={'Network'}
                inbound={`${bytesToString(stats.rx)}`}
                outbound={`${bytesToString(stats.tx)}`}
                legend={
                    <>
                        <Tooltip arrow content={'Inbound'}>
                            <CloudDownloadIcon className={'mr-2 w-4 h-4 text-yellow-400'} />
                        </Tooltip>
                        <Tooltip arrow content={'Outbound'}>
                            <CloudUploadIcon className={'w-4 h-4 text-cyan-400'} />
                        </Tooltip>
                    </>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
