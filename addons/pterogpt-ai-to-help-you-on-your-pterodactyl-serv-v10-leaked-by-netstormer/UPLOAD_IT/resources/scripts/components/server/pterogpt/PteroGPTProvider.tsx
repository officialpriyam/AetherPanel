import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePteroGPT } from './hooks/usePteroGPT';
import { useConversation } from './hooks/useConversation';
import { useErrorDetection } from './hooks/useErrorDetection';
import { PteroGPTConfig, RateLimits, ConversationMessage } from '@/api/server/pterogpt';
import { DetectedError } from './ErrorDetector';

interface PteroGPTContextType {
    config: PteroGPTConfig | null;
    limits: RateLimits | null;
    loading: boolean;
    refreshLimits: () => Promise<void>;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    messages: ConversationMessage[];
    addUserMessage: (content: string) => void;
    addAssistantMessage: (response: any) => void;
    clearConversation: () => void;
    getHistory: () => ConversationMessage[];
    hasRecentErrors: boolean;
    getRecentContext: (count?: number) => string[];
    addConsoleLine: (line: string) => void;
    fileContext: { path: string; content: string } | null;
    setFileContext: (ctx: { path: string; content: string } | null) => void;
    errors: DetectedError[];
}

const PteroGPTContext = createContext<PteroGPTContextType | null>(null);

export const usePteroGPTContext = () => {
    const context = useContext(PteroGPTContext);
    if (!context) {
        throw new Error('usePteroGPTContext must be used within PteroGPTProvider');
    }
    return context;
};

interface Props {
    children: ReactNode;
}

export const PteroGPTProvider: React.FC<Props> = ({ children }) => {
    const { config, limits, loading, refreshLimits } = usePteroGPT();
    const conversation = useConversation();
    const errorDetection = useErrorDetection();
    const [isOpen, setIsOpen] = useState(false);
    const [fileContext, setFileContext] = useState<{ path: string; content: string } | null>(null);

    // Prevent horizontal overflow globally
    useEffect(() => {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        const originalHtmlOverflowX = htmlElement.style.overflowX;
        const originalBodyOverflowX = bodyElement.style.overflowX;

        htmlElement.style.overflowX = 'hidden';
        bodyElement.style.overflowX = 'hidden';

        return () => {
            htmlElement.style.overflowX = originalHtmlOverflowX;
            bodyElement.style.overflowX = originalBodyOverflowX;
        };
    }, []);

    const value: PteroGPTContextType = {
        config,
        limits,
        loading,
        refreshLimits,
        isOpen,
        setIsOpen,
        ...conversation,
        hasRecentErrors: errorDetection.hasRecentErrors,
        getRecentContext: errorDetection.getRecentContext,
        addConsoleLine: errorDetection.addConsoleLine,
        fileContext,
        setFileContext,
        errors: errorDetection.errors,
    };

    return <PteroGPTContext.Provider value={value}>{children}</PteroGPTContext.Provider>;
};