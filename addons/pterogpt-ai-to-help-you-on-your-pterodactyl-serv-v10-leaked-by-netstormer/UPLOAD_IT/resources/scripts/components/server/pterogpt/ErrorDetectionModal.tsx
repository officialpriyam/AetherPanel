import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { usePteroGPTContext } from './PteroGPTProvider';

const Overlay = styled.div<{ isOpen: boolean }>`
    ${tw`fixed inset-0 bg-black/60 z-50 transition-opacity`}
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
`;

const Modal = styled.div<{ isOpen: boolean }>`
    ${tw`fixed top-1/2 left-1/2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-50 transition-all duration-200`}
    width: 500px;
    transform: translate(-50%, -50%) scale(${({ isOpen }) => (isOpen ? 1 : 0.95)});
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
`;

const ModalHeader = styled.div`
    ${tw`px-6 py-4 border-b border-neutral-700`}
`;

const ModalTitle = styled.h3`
    ${tw`text-base font-medium text-neutral-200`}
`;

const ModalBody = styled.div`
    ${tw`px-6 py-4`}
`;

const ErrorMessage = styled.div`
    ${tw`text-sm text-neutral-400 mb-4`}
`;

const ButtonGroup = styled.div`
    ${tw`flex gap-3 justify-end`}
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
    ${tw`px-4 py-2 rounded text-sm font-medium transition-colors`}
    ${({ variant }) =>
        variant === 'primary'
            ? tw`bg-cyan-500 hover:bg-cyan-600 text-neutral-900`
            : tw`bg-neutral-700 hover:bg-neutral-600 text-neutral-200`}
`;

export const ErrorDetectionModal: React.FC = () => {
    const { hasRecentErrors, setIsOpen, errors } = usePteroGPTContext();
    const [showModal, setShowModal] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (hasRecentErrors && !dismissed && errors.length > 0) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasRecentErrors, dismissed, errors]);

    const handleGetHelp = () => {
        setShowModal(false);
        setDismissed(true);
        setIsOpen(true);
    };

    const handleDismiss = () => {
        setShowModal(false);
        setDismissed(true);
    };

    useEffect(() => {
        if (!hasRecentErrors) {
            setDismissed(false);
        }
    }, [hasRecentErrors]);

    const lastError = errors[errors.length - 1];

    return (
        <>
            <Overlay isOpen={showModal} onClick={handleDismiss} />
            <Modal isOpen={showModal}>
                <ModalHeader>
                    <ModalTitle>Error Detected</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <ErrorMessage>
                        An error was detected in the console output. Would you like AI assistance to diagnose and resolve
                        this issue?
                        {lastError && (
                            <div css={tw`mt-3 p-3 bg-neutral-900 rounded text-xs font-mono text-red-400`}>
                                {lastError.line.substring(0, 200)}
                                {lastError.line.length > 200 && '...'}
                            </div>
                        )}
                    </ErrorMessage>
                    <ButtonGroup>
                        <Button variant="secondary" onClick={handleDismiss}>
                            Dismiss
                        </Button>
                        <Button variant="primary" onClick={handleGetHelp}>
                            Get Help
                        </Button>
                    </ButtonGroup>
                </ModalBody>
            </Modal>
        </>
    );
};