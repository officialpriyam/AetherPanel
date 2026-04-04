import React, { useEffect } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import Modal from '@/components/elements/Modal';
import { usePteroGPTContext } from './PteroGPTProvider';
import { ChatInterface } from './ChatInterface';

const ModalContent = styled.div`
    ${tw`bg-neutral-800 p-0 rounded-lg shadow-2xl`}
    min-height: 28rem;
    max-height: 75vh;
    overflow: hidden;
    max-width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Header = styled.div`
    ${tw`px-6 py-5 border-b border-neutral-700 bg-gradient-to-b from-neutral-900 to-neutral-800`}
`;

const HeaderContent = styled.div`
    ${tw`flex items-center justify-between`}
`;

const HeaderText = styled.div`
    ${tw`flex items-center gap-3`}
`;

const IconWrapper = styled.div`
    ${tw`w-10 h-10 rounded-lg bg-cyan-500 bg-opacity-10 flex items-center justify-center`}
`;

const TitleWrapper = styled.div``;

const Title = styled.h3`
    ${tw`text-base font-semibold text-neutral-100`}
`;

const Subtitle = styled.div`
    ${tw`text-xs text-neutral-500 mt-0.5`}
`;

const ChatWrapper = styled.div`
    ${tw`h-full bg-neutral-800`}
    height: calc(75vh - 6.5rem);
    overflow: hidden;
`;

export const PteroGPTModal: React.FC = () => {
    const { isOpen, setIsOpen, config } = usePteroGPTContext();

    // Fix body overflow when modal opens/closes
    useEffect(() => {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        if (isOpen) {
            htmlElement.style.overflow = 'hidden';
            htmlElement.style.overflowX = 'hidden';
            bodyElement.style.overflow = 'hidden';
            bodyElement.style.overflowX = 'hidden';
        } else {
            htmlElement.style.overflow = '';
            htmlElement.style.overflowX = 'hidden';
            bodyElement.style.overflow = '';
            bodyElement.style.overflowX = 'hidden';
        }

        return () => {
            htmlElement.style.overflow = '';
            htmlElement.style.overflowX = '';
            bodyElement.style.overflow = '';
            bodyElement.style.overflowX = '';
        };
    }, [isOpen]);

    if (config?.ui_mode !== 'modal') {
        return null;
    }

    return (
        <Modal visible={isOpen} onDismissed={() => setIsOpen(false)} appear top={false}>
            <ModalContent>
                <Header>
                    <HeaderContent>
                        <HeaderText>
                            <IconWrapper>
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </IconWrapper>
                            <TitleWrapper>
                                <Title>AI Assistant</Title>
                                <Subtitle>Powered by PteroGPT</Subtitle>
                            </TitleWrapper>
                        </HeaderText>
                    </HeaderContent>
                </Header>
                <ChatWrapper>
                    <ChatInterface />
                </ChatWrapper>
            </ModalContent>
        </Modal>
    );
};