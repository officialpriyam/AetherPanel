import React from 'react';
import classNames from 'classnames';
import { ServerContext } from '@/state/server';
import styles from '@/components/server/console/style.module.css';
import { ChipIcon, CloudIcon } from '@heroicons/react/outline';
import { LuMemoryStick, LuHardDrive } from "react-icons/lu";

interface ChartBlockProps {
    type: string;
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
    usage?: string;
    limit?: string;
    inbound?: string;
    outbound?: string;
}

export default ({ type, title, legend, usage, limit, inbound, outbound, children }: ChartBlockProps) => {
    const status = ServerContext.useStoreState((state) => state.status.value);

    const shellStyle: React.CSSProperties = {
        backgroundColor: 'rgba(17, 24, 39, 0.78)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        boxShadow: '0 18px 42px rgba(2, 6, 23, 0.18)',
    };

    const iconStyle: React.CSSProperties = {
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
    };

    const getIcon = () => {
        switch (type) {
            case 'cpu': return <ChipIcon className={'w-10'}/>;
            case 'network': return <CloudIcon className={'w-10'}/>;
            case 'disk': return <LuHardDrive className={'text-[2.5rem]'}/>;
            default: return <LuMemoryStick className={'text-[2.5rem]'}/>;
        }
    };

    return (
    <>
    <div className={'backdrop overflow-hidden rounded-box'} style={shellStyle}>
        <div className={'px-6 pt-5 flex justify-between items-center'}>
            <div>
                <span className={'text-gray-300'}>{title}:</span>
                <div className={'flex items-center gap-x-1'}>
                    {status === 'offline' ? (
                        <p>Offline</p>
                    ) : (
                        <p className={'text-lg font-medium'}>
                            {usage && usage}
                            {inbound && outbound && `${inbound} / ${outbound}`}
                        </p>
                    )}
                    <span className={'text-gray-300 font-medium'}>{limit && '/ ' + limit}</span>
                </div>
            </div>
            <div className={'text-white rounded-component w-16 h-16 flex items-center justify-center'} style={iconStyle}>
                {getIcon()}
            </div>
        </div>
        <div css={'left:-11px;bottom:-11px;width:calc(100% + 17px);position:relative;'}>
            {children}
        </div>
    </div>
    </>
)};
