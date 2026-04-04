import React, { useState, useRef, useEffect } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { ServerContext } from '@/state/server';
import { sendChat } from '@/api/server/pterogpt';
import { usePteroGPTContext } from './PteroGPTProvider';
import { MessageBubble } from './MessageBubble';
import Button from '@/components/elements/Button';

const Container = styled.div`
    ${tw`flex flex-col h-full bg-neutral-800`}
    overflow: hidden;
    max-width: 100%;
`;

const Header = styled.div`
    ${tw`px-6 py-3 border-b border-neutral-700 bg-neutral-900 flex items-center justify-between`}
`;

const NewChatButton = styled.button`
    ${tw`text-xs px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:text-neutral-100 transition-colors flex items-center gap-1.5 font-medium`}
    &:hover svg {
        ${tw`text-cyan-400`}
    }
`;

const MessagesArea = styled.div<{ hasHeader?: boolean }>`
    ${tw`flex-1 px-6 py-4`}
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 100%;
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        ${tw`bg-neutral-900`}
    }
    &::-webkit-scrollbar-thumb {
        ${tw`bg-neutral-600 rounded`}
        &:hover {
            ${tw`bg-neutral-500`}
        }
    }
`;

const InputArea = styled.div`
    ${tw`border-t border-neutral-700 p-4 bg-neutral-900`}
    max-width: 100%;
    overflow: hidden;
`;

const ContextInfo = styled.div`
    ${tw`mb-2 px-3 py-2 bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded text-xs flex items-center gap-2`}
    max-width: 100%;
`;

const ContextBadge = styled.span`
    ${tw`text-cyan-400 font-semibold`}
`;

const InputWrapper = styled.div`
    ${tw`flex gap-2 items-stretch`}
    max-width: 100%;
`;

const TextArea = styled.textarea`
    ${tw`flex-1 bg-neutral-700 border border-neutral-600 rounded px-3 text-neutral-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
    max-height: 10rem;
    max-width: 100%;
    word-wrap: break-word;
    min-height: 2.375rem;
    padding-top: 0.5625rem;
    padding-bottom: 0.5625rem;
    line-height: 1.25rem;
    display: flex;
    align-items: center;
    &::placeholder {
        ${tw`text-neutral-500`}
    }
    &:disabled {
        ${tw`opacity-50 cursor-not-allowed`}
    }
`;

const LimitsInfo = styled.div`
    ${tw`text-xs text-neutral-600 mt-2`}
`;

const EmptyState = styled.div`
    ${tw`flex flex-col items-center justify-center h-full text-neutral-500 text-center px-4`}
`;

const EmptyStateIcon = styled.div`
    ${tw`text-neutral-700 text-6xl mb-4`}
`;

const LoadingIndicator = styled.div`
    ${tw`text-neutral-400 text-sm py-2 px-4 bg-neutral-700/50 rounded-lg inline-block mb-3`}
`;

export const ChatInterface: React.FC = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const {
        config,
        limits,
        messages,
        addUserMessage,
        addAssistantMessage,
        clearConversation,
        getHistory,
        getRecentContext,
        fileContext,
        setFileContext,
        refreshLimits,
        hasRecentErrors,
        errors,
    } = usePteroGPTContext();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = async () => {
        if (!uuid || !input.trim() || loading) return;

        const message = input.trim();
        setInput('');
        addUserMessage(message);
        setLoading(true);

        try {
            // Build context
            const context: any = {};

            const consoleLines = getRecentContext(50);
            const validConsoleLines = consoleLines.filter((line) => typeof line === 'string' && line.trim() !== '');
            if (validConsoleLines.length > 0) {
                context.console_lines = validConsoleLines.join('\n');
            }

            if (fileContext) {
                context.file_path = fileContext.path;
                context.file_content = fileContext.content;
            }

            const response = await sendChat(
                uuid,
                message,
                Object.keys(context).length > 0 ? context : undefined,
                getHistory(),
                config?.model_mode === 'list' ? config.models?.[0] : undefined
            );

            addAssistantMessage(response);
            refreshLimits();
        } catch (err) {
            addAssistantMessage({
                response: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        clearConversation();
        setFileContext(null);
        setInput('');
    };

    return (
        <Container>
            {messages.length > 0 && (
                <Header>
                    <div css={tw`text-xs text-neutral-400`}>
                        {messages.length} message{messages.length > 1 ? 's' : ''}
                    </div>
                    <NewChatButton onClick={handleNewChat}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        New Chat
                    </NewChatButton>
                </Header>
            )}
            <MessagesArea hasHeader={messages.length > 0}>
                {messages.length === 0 ? (
                    <EmptyState>
                        <EmptyStateIcon>
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                            </svg>
                        </EmptyStateIcon>
                        <div css={tw`text-neutral-400 mb-2`}>No conversation yet</div>
                        <div css={tw`text-sm text-neutral-600 max-w-sm`}>
                            {fileContext
                                ? 'File loaded in context. Ask questions about this file.'
                                : hasRecentErrors
                                ? 'Console errors detected. Ask me to analyze them.'
                                : 'Start by asking a question about server errors, configuration, or general server management.'}
                        </div>
                    </EmptyState>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} role={msg.role} content={msg.content} />
                        ))}
                        {loading && <LoadingIndicator>Analyzing your request...</LoadingIndicator>}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </MessagesArea>

            <InputArea>
                {(hasRecentErrors || fileContext) && (
                    <ContextInfo>
                        {hasRecentErrors && errors.length > 0 && (
                            <>
                                <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <ContextBadge>{errors.length} console error{errors.length > 1 ? 's' : ''}</ContextBadge>
                            </>
                        )}
                        {hasRecentErrors && fileContext && (
                            <span css={tw`text-neutral-500`}>+</span>
                        )}
                        {fileContext && (
                            <>
                                <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <ContextBadge css={tw`truncate`}>{fileContext.path}</ContextBadge>
                            </>
                        )}
                        <span css={tw`text-neutral-500 ml-auto`}>will be sent</span>
                    </ContextInfo>
                )}
                <InputWrapper>
                    <TextArea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        disabled={loading || !config?.enabled}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !config?.enabled}
                        size="small"
                    >
                        Send
                    </Button>
                </InputWrapper>
                {limits && (
                    <LimitsInfo>
                        Requests: {limits.chat.remaining}/{limits.chat.limit} remaining
                    </LimitsInfo>
                )}
            </InputArea>
        </Container>
    );
};