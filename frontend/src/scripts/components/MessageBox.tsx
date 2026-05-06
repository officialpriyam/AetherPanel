import * as React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { CheckCircleIcon, InformationCircleIcon, ExclamationCircleIcon, ExclamationIcon } from '@heroicons/react/outline'

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

const AlertCard = styled.div<{ $embedded: boolean; $compact: boolean; $hideTitle: boolean; }>`
    ${tw`w-full px-4 py-3 rounded-component flex gap-x-3 items-start shadow-2xl text-gray-100 border`};
    position: relative;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    background-color: color-mix(in srgb, var(--gray600) 70%, transparent);
    animation: fadeIn 0.22s ease-out;

    ${({ $embedded, $compact }) => !$embedded && $compact ? tw`max-w-[320px]` : tw`max-w-[400px]`};
    ${({ $embedded }) => $embedded ? tw`max-w-none` : ''};

    & > .icon {
        ${tw`w-8 h-8 rounded flex items-center justify-center flex-shrink-0`};
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

interface Props {
    title?: string;
    children: React.ReactNode;
    type?: FlashMessageType;
    embedded?: boolean;
}

const MessageBox = ({ title, children, type = 'info', embedded = false }: Props) => {
    const flashMessage = useStoreState((state: ApplicationStore) => state.settings.data!.flash.flashMessage);
    const compact = !embedded && flashMessage === 1;
    const hideTitle = !embedded && flashMessage === 2;

    return (
        <AlertCard
            $embedded={embedded}
            $compact={compact}
            $hideTitle={hideTitle}
            className={
                type === 'success'
                    ? '!bg-green-600/30 border-green-400/40 text-gray-50'
                    : type === 'info'
                    ? '!bg-blue-600/30 border-blue-400/40 text-gray-50'
                    : type === 'error'
                    ? '!bg-red-600/30 border-red-400/40 text-gray-50'
                    : '!bg-yellow-600/30 border-yellow-400/40 text-gray-50'
            }
        >
            {type === 'success'
            ? <div className={'icon bg-green-600'}>
                <CheckCircleIcon className={'w-5 text-green-300'} />
            </div>
            : type === 'info'
            ? <div className={'icon bg-blue-600'}>
                <InformationCircleIcon className={'w-5 text-blue-300'} />
            </div>
            : type === 'error'
            ? <div className={'icon bg-red-600'}>
                <ExclamationCircleIcon className={'w-5 text-red-300'} />
            </div>
            : <div className={'icon bg-yellow-600'}>
                <ExclamationIcon className={'w-5 text-yellow-300'} />
            </div>
            }
            <div className={'min-w-0'}>
                {!hideTitle && title ? <p className={'font-semibold text-sm'}>{title}</p> : null}
                <p className={hideTitle ? 'text-gray-50' : 'text-gray-100'}>{children}</p>
            </div>
        </AlertCard>
    );
};

MessageBox.displayName = 'MessageBox';

export default MessageBox;
