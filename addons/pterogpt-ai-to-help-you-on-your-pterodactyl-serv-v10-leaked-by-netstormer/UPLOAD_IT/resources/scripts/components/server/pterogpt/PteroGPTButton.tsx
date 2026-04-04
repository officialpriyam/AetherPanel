import React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { usePteroGPTContext } from './PteroGPTProvider';

const Button = styled.button<{ hasErrors: boolean }>`
    ${tw`fixed bottom-6 right-6 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-lg transition-all z-40 border`}
    ${({ hasErrors }) =>
        hasErrors
            ? tw`bg-red-500 hover:bg-red-600 border-red-400 text-white`
            : tw`bg-neutral-700 hover:bg-neutral-600 border-neutral-600 text-neutral-200`}
`;

const IconWrapper = styled.div`
    ${tw`relative`}
`;

const Badge = styled.span`
    ${tw`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold`}
`;

export const PteroGPTButton: React.FC = () => {
    const { config, isOpen, setIsOpen, hasRecentErrors, loading } = usePteroGPTContext();

    if (!config?.enabled || loading) {
        return null;
    }

    return (
        <Button
            hasErrors={hasRecentErrors}
            onClick={() => setIsOpen(!isOpen)}
            title={hasRecentErrors ? 'Error detected - Click for assistance' : 'Open AI Assistant'}
        >
            <IconWrapper>
                AI
                {hasRecentErrors && <Badge>!</Badge>}
            </IconWrapper>
        </Button>
    );
};