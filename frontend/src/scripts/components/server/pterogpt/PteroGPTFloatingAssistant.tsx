import { ConversationMessage, getConfig, getLimits, PteroGPTConfig, PteroGPTLimits, sendChat } from '@/api/server/pterogpt';
import Button from '@/components/elements/Button';
import Select from '@/components/elements/Select';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { usePermissions } from '@/plugins/usePermissions';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { ChipIcon, MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { useStoreState } from 'easy-peasy';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import tw from 'twin.macro';

const USER_ROLE = 'user' as const;
const ASSISTANT_ROLE = 'assistant' as const;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const canUseAssistant = usePermissions('pterogpt.chat')[0];
    const addonEnabled = String(
        useStoreState((state: ApplicationStore) => state.settings.data!.flash.addon_pterogpt_enabled)
    ) === 'true';

    const { clearAndAddHttpError } = useFlash();

    const [open, setOpen] = useState(false);
    const [showConversations, setShowConversations] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [config, setConfig] = useState<PteroGPTConfig | null>(null);
    const [limits, setLimits] = useState<PteroGPTLimits | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [input, setInput] = useState('');

    const endRef = useRef<HTMLDivElement | null>(null);

    const remaining = useMemo(() => limits?.chat.remaining ?? 0, [limits]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending, open]);

    const loadAssistant = async () => {
        setLoading(true);

        try {
            const [cfg, lim] = await Promise.all([getConfig(uuid), getLimits(uuid)]);
            setConfig(cfg);
            setLimits(lim);
            setSelectedModel(cfg.model_mode === 'list' ? cfg.models?.[0] || '' : cfg.model || '');
        } catch (error) {
            clearAndAddHttpError({ key: 'pterogpt-floating', error });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && !config && !loading) {
            loadAssistant();
        }
    }, [open]);

    const onSend = async () => {
        const content = input.trim();
        if (!content || !config || sending) {
            return;
        }

        if (!config.enabled || remaining <= 0) {
            return;
        }

        const userMessage: ConversationMessage = { role: USER_ROLE, content };
        const history = messages.slice(-20);
        setMessages((state) => [...state, userMessage]);
        setInput('');
        setSending(true);

        try {
            const response = await sendChat(
                uuid,
                content,
                history,
                config.model_mode === 'list' ? selectedModel || undefined : undefined
            );
            setMessages((state) => [...state, { role: ASSISTANT_ROLE, content: response.response }]);
            setLimits(await getLimits(uuid));
        } catch (error) {
            clearAndAddHttpError({ key: 'pterogpt-floating', error });
            setMessages((state) => [
                ...state,
                {
                    role: ASSISTANT_ROLE,
                    content: 'I could not process that request right now. Please try again in a moment.',
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    const onClose = () => {
        if (sending) {
            return;
        }
        setOpen(false);
    };

    if (!addonEnabled || !canUseAssistant) {
        return null;
    }

    return (
        <>
            <button
                type={'button'}
                onClick={() => setOpen(true)}
                css={tw`fixed right-5 bottom-5 z-40 rounded-full px-4 py-3 border border-gray-500/70 bg-gray-800/70 text-gray-100 shadow-xl backdrop-blur-md flex items-center gap-2 hover:bg-gray-700/80 transition-colors`}
            >
                <ChipIcon css={tw`w-5 h-5`} />
                AI Assistant
            </button>

            {open && (
                <div css={tw`fixed inset-0 z-40`}>
                <div css={tw`absolute inset-0 bg-black/40 backdrop-blur-sm`} onClick={onClose} />
                    <div
                        css={tw`absolute right-5 bottom-5 top-5 w-[420px] max-w-[92vw] rounded-2xl border border-gray-600/70 bg-gray-900/70 shadow-2xl backdrop-blur-xl flex overflow-hidden`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {showConversations && (
                            <aside css={tw`w-44 border-r border-gray-700/70 p-4 flex flex-col gap-3`}>
                                <div css={tw`flex items-center justify-between gap-2`}>
                                    <p css={tw`text-xs uppercase tracking-wider text-gray-400`}>Conversations</p>
                                    <button
                                        type={'button'}
                                        onClick={() => setShowConversations(false)}
                                        css={tw`text-gray-400 hover:text-gray-100`}
                                    >
                                        <XIcon css={tw`w-4 h-4`} />
                                    </button>
                                </div>
                                <button
                                    type={'button'}
                                    onClick={() => setMessages([])}
                                    css={tw`rounded-lg border border-gray-600/70 bg-gray-800/70 px-3 py-2 text-xs text-gray-100 hover:bg-gray-700/80`}
                                >
                                    New Chat
                                </button>
                                <div css={tw`mt-1 space-y-2`}>
                                    <div css={tw`rounded-lg border border-gray-700/60 bg-gray-800/60 px-3 py-2`}>
                                        <p css={tw`text-xs text-gray-200`}>Current chat</p>
                                        <p css={tw`text-[11px] text-gray-400`}>{messages.length} messages</p>
                                    </div>
                                </div>
                            </aside>
                        )}

                        <section css={tw`flex-1 flex flex-col`}>
                            <div css={tw`px-4 py-3 border-b border-gray-700/70 flex items-center justify-between gap-3`}>
                                <div css={tw`flex items-center gap-2`}>
                                    <button
                                        type={'button'}
                                        onClick={() => setShowConversations((state) => !state)}
                                        css={tw`text-gray-400 hover:text-gray-100`}
                                    >
                                        <MenuAlt2Icon css={tw`w-5 h-5`} />
                                    </button>
                                    <div>
                                        <p css={tw`text-sm font-semibold text-gray-100`}>PriyxStudio AI</p>
                                        <p css={tw`text-[11px] text-gray-400`}>Server assistant</p>
                                    </div>
                                </div>
                                <div css={tw`flex items-center gap-2`}>
                                    {config && (
                                        <span css={tw`text-[11px] px-2 py-1 rounded-full border border-gray-600 text-gray-200`}>
                                            Remaining: {remaining}
                                        </span>
                                    )}
                                    <button
                                        type={'button'}
                                        onClick={onClose}
                                        css={tw`text-gray-400 hover:text-gray-100`}
                                    >
                                        <XIcon css={tw`w-5 h-5`} />
                                    </button>
                                </div>
                            </div>

                            {loading || !config ? (
                                <div css={tw`flex-1 flex items-center justify-center`}>
                                    <Spinner centered size={'large'} />
                                </div>
                            ) : (
                                <>
                                    {config.model_mode === 'list' && (
                                        <div css={tw`px-4 pt-3 max-w-xs`}>
                                            <Select value={selectedModel} onChange={(event) => setSelectedModel(event.currentTarget.value)}>
                                                {(config.models || []).map((model) => (
                                                    <option key={model} value={model}>
                                                        {model}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    )}

                                    <div css={tw`flex-1 px-4 py-3 space-y-2 overflow-y-auto`}>
                                        {messages.length === 0 ? (
                                            <div css={tw`rounded-xl border border-gray-700/70 bg-gray-800/60 px-4 py-3`}>
                                                <p css={tw`text-sm text-gray-200`}>Hi! I am your PriyxStudio AI assistant.</p>
                                                <p css={tw`text-xs text-gray-400 mt-1`}>Ask me anything about this server.</p>
                                            </div>
                                        ) : (
                                            messages.map((message, index) => (
                                                <div
                                                    key={`${message.role}_${index}`}
                                                    css={[
                                                        tw`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap border`,
                                                        message.role === USER_ROLE
                                                            ? tw`bg-gray-800/80 border-gray-600/80 text-gray-100 ml-6`
                                                            : tw`bg-gray-900/60 border-gray-700/80 text-gray-200 mr-6`,
                                                    ]}
                                                >
                                                    {message.content}
                                                </div>
                                            ))
                                        )}
                                        {sending && <p css={tw`text-xs text-gray-300`}>Thinking...</p>}
                                        <div ref={endRef} />
                                    </div>

                                    <div css={tw`px-4 pb-4 pt-2 border-t border-gray-700/70`}>
                                        <textarea
                                            css={tw`w-full rounded-xl bg-gray-800/70 border border-gray-600 text-sm text-gray-100 px-3 py-2 min-h-[88px] focus:outline-none focus:border-gray-400`}
                                            value={input}
                                            onChange={(event) => setInput(event.currentTarget.value)}
                                            onKeyDown={onKeyDown}
                                            placeholder={'Type your message... (Shift+Enter for newline)'}
                                            disabled={!config.enabled || sending}
                                        />
                                        <div css={tw`mt-3 flex items-center justify-between gap-2`}>
                                            <Button type={'button'} isSecondary onClick={() => setMessages([])}>
                                                Clear
                                            </Button>
                                            <Button type={'button'} disabled={!config.enabled || sending || !input.trim()} onClick={onSend}>
                                                {sending ? 'Sending...' : 'Send'}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </>
    );
};
