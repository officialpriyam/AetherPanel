import React, { useEffect } from 'react';
import MessageBox from '@/components/MessageBox';
import Portal from '@/components/elements/Portal';
import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { FlashMessage } from '@/state/flashes';

type Props = Readonly<{
    byKey?: string;
    className?: string;
}>;

const InlineStack = styled.div`
    ${tw`flex flex-col gap-3`};
`;

const ToastStack = styled.div<{ $compact: boolean }>`
    ${tw`fixed z-[120] flex flex-col gap-3 pointer-events-none`};
    width: calc(100vw - 2rem);

    ${({ $compact }) => $compact
        ? tw`top-4 right-4 items-end`
        : tw`bottom-4 left-1/2 items-center`};
    ${({ $compact }) => $compact ? 'max-width: 320px;' : 'max-width: 400px; transform: translateX(-50%);'};
`;

const FlashMessageItem = ({ flash, embedded }: { flash: FlashMessage; embedded: boolean }) => {
    const removeFlash = useStoreActions((actions) => actions.flashes.removeFlash);

    useEffect(() => {
        if (!flash.id) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            removeFlash(flash.id!);
        }, 6000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [flash.id, removeFlash]);

    return (
        <MessageBox embedded={embedded} type={flash.type} title={flash.title}>
            {flash.message}
        </MessageBox>
    );
};

const FlashMessageRender = ({ byKey, className }: Props) => {
    const flashes = useStoreState((state) =>
        state.flashes.items.filter((flash) => (byKey ? flash.key === byKey : true))
    );
    const flashMessageStyle = useStoreState((state) => state.settings.data?.flash.flashMessage ?? 1);
    const inline = Boolean(byKey || className);

    if (!flashes.length) {
        return null;
    }

    const content = flashes.map((flash) => (
        <FlashMessageItem
            key={flash.id || `${flash.key || 'global'}-${flash.type}-${flash.message}`}
            flash={flash}
            embedded={inline}
        />
    ));

    if (inline) {
        return <InlineStack className={className}>{content}</InlineStack>;
    }

    return (
        <Portal>
            <ToastStack className={className} $compact={flashMessageStyle === 1}>
                {content}
            </ToastStack>
        </Portal>
    );
};

export default FlashMessageRender;
