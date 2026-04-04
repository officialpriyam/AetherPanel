import React, { useEffect } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { usePteroGPTContext } from './PteroGPTProvider';
import { ChatInterface } from './ChatInterface';

const PanelContainer = styled.div<{ isOpen: boolean }>`
    ${tw`fixed top-0 h-full bg-neutral-900 border-l border-neutral-700 transition-transform duration-300 z-50`}
    width: 28rem;
    max-width: 100vw;
    overflow: hidden;
    right: 0;
    transform: translateX(${({ isOpen }) => (isOpen ? '0' : '100%')});
    pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
    will-change: transform;
`;

const Header = styled.div`
    ${tw`px-6 py-4 border-b border-neutral-700 bg-neutral-800`}
`;

const HeaderContent = styled.div`
    ${tw`flex items-center justify-between`}
`;

const Title = styled.h3`
    ${tw`text-base font-medium text-neutral-200`}
`;

const Subtitle = styled.div`
    ${tw`text-xs text-neutral-500 mt-1`}
`;

const CloseButton = styled.button`
    ${tw`text-neutral-400 hover:text-neutral-200 transition-colors`}
`;

const ChatWrapper = styled.div`
    ${tw`h-full overflow-hidden`}
    height: calc(100vh - 5rem);
`;

export const PteroGPTPanel: React.FC = () => {
    const { isOpen, setIsOpen, config } = usePteroGPTContext();

    // Fix body overflow when panel opens/closes
    useEffect(() => {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        // Always prevent horizontal overflow
        htmlElement.style.overflowX = 'hidden';
        bodyElement.style.overflowX = 'hidden';
        htmlElement.style.maxWidth = '100vw';
        bodyElement.style.maxWidth = '100vw';

        return () => {
            htmlElement.style.overflowX = '';
            bodyElement.style.overflowX = '';
            htmlElement.style.maxWidth = '';
            bodyElement.style.maxWidth = '';
        };
    }, []);

    if (config?.ui_mode !== 'panel') {
        return null;
    }

    return (
        <PanelContainer isOpen={isOpen}>
            <Header>
                <HeaderContent>
                    <div>
                        <Title>AI Assistant</Title>
                        <Subtitle>Error analysis and help</Subtitle>
                    </div>
                    <CloseButton onClick={() => setIsOpen(false)} aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </CloseButton>
                </HeaderContent>
            </Header>
            <ChatWrapper>
                <ChatInterface />
            </ChatWrapper>
        </PanelContainer>
    );
};