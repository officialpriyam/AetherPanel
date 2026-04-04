import { useState, useCallback } from 'react';
import { ConversationMessage, ChatResponse } from '@/api/server/pterogpt';

interface UseConversationReturn {
    messages: ConversationMessage[];
    addUserMessage: (content: string) => void;
    addAssistantMessage: (response: ChatResponse) => void;
    clearConversation: () => void;
    getHistory: () => ConversationMessage[];
}

export const useConversation = (): UseConversationReturn => {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);

    const addUserMessage = useCallback((content: string) => {
        setMessages((prev) => [...prev, { role: 'user', content }]);
    }, []);

    const addAssistantMessage = useCallback((response: ChatResponse) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    }, []);

    const clearConversation = useCallback(() => {
        setMessages([]);
    }, []);

    const getHistory = useCallback(() => {
        return messages.slice(-20);
    }, [messages]);

    return {
        messages,
        addUserMessage,
        addAssistantMessage,
        clearConversation,
        getHistory,
    };
};