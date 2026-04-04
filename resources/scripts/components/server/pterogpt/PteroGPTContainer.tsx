import { ConversationMessage, getConfig, getLimits, PteroGPTConfig, PteroGPTLimits, sendChat } from '@/api/server/pterogpt';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import Select from '@/components/elements/Select';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import styles from '@/components/server/addons-style.module.css';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { AdjustmentsIcon } from '@heroicons/react/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import tw from 'twin.macro';

const USER_ROLE = 'user' as const;
const ASSISTANT_ROLE = 'assistant' as const;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data!.name);

    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [config, setConfig] = useState<PteroGPTConfig | null>(null);
    const [limits, setLimits] = useState<PteroGPTLimits | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState<string>('');

    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        document.title = `${serverName} | AI Assistant`;
    }, [serverName]);

    useEffect(() => {
        clearFlashes('pterogpt');
    }, []);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const load = async () => {
        setLoading(true);
        clearFlashes('pterogpt');

        try {
            const [cfg, lim] = await Promise.all([getConfig(uuid), getLimits(uuid)]);
            setConfig(cfg);
            setLimits(lim);
            setSelectedModel(cfg.model_mode === 'list' ? cfg.models?.[0] || '' : cfg.model || '');
        } catch (error) {
            clearAndAddHttpError({ key: 'pterogpt', error });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [uuid]);

    const remaining = useMemo(() => limits?.chat.remaining ?? 0, [limits]);

    const onSend = async () => {
        const value = input.trim();
        if (!config || !value || sending) {
            return;
        }

        if (!config.enabled) {
            addFlash({ key: 'pterogpt', type: 'error', message: 'AI assistant is disabled by admin settings.' });

            return;
        }

        if (remaining <= 0) {
            addFlash({ key: 'pterogpt', type: 'error', message: 'You have reached the hourly chat limit.' });

            return;
        }

        const userMessage: ConversationMessage = { role: USER_ROLE, content: value };
        const history = messages.slice(-20);

        setMessages((state) => [...state, userMessage]);
        setInput('');
        setSending(true);

        try {
            const response = await sendChat(
                uuid,
                value,
                history,
                config.model_mode === 'list' ? selectedModel || undefined : undefined
            );

            setMessages((state) => [...state, { role: ASSISTANT_ROLE, content: response.response }]);
            setLimits(await getLimits(uuid));
        } catch (error) {
            clearAndAddHttpError({ key: 'pterogpt', error });
            setMessages((state) => [
                ...state,
                {
                    role: ASSISTANT_ROLE,
                    content: 'I could not process that request right now. Please check API settings or try again.',
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

    return (
        <ServerContentBlock title={'AI Assistant'} icon={AdjustmentsIcon}>
            <FlashMessageRender byKey={'pterogpt'} css={tw`mb-4`} />

            {loading || !config ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className={styles.shell}>
                    <header className={styles.hero}>
                        <span className={styles.brand}>PriyxStudio AI</span>
                        <h2 className={styles.title}>Modern Glass Assistant</h2>
                        <p className={styles.subtitle}>
                            Ask for troubleshooting, optimization, and configuration help directly from your server panel.
                        </p>
                    </header>

                    <section className={styles.controls}>
                        <div css={tw`flex flex-wrap items-center gap-3`}>
                            <span className={`${styles.tag} ${config.enabled ? styles.tagSuccess : styles.tagWarn}`}>
                                {config.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <span className={styles.tag}>Hourly Remaining: {limits?.chat.remaining ?? 0}</span>
                            <span className={styles.tag}>Used: {limits?.chat.used ?? 0}</span>
                        </div>

                        {config.model_mode === 'list' && (
                            <div css={tw`mt-3 max-w-sm`}>
                                <Select value={selectedModel} onChange={(event) => setSelectedModel(event.currentTarget.value)}>
                                    {(config.models || []).map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </section>

                    <section css={tw`p-4 md:p-6`}>
                        <div css={tw`rounded-box border border-gray-600/60 bg-gray-900/40 min-h-[320px] max-h-[440px] overflow-y-auto p-4 space-y-3`}>
                            {messages.length === 0 ? (
                                <p css={tw`text-sm text-gray-300`}>
                                    Start a chat by asking a question about your server errors, configs, or performance.
                                </p>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={`${message.role}_${index}`}
                                        css={[
                                            tw`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap`,
                                            message.role === USER_ROLE
                                                ? tw`bg-blue-500/20 border border-blue-500/40 text-blue-50 ml-8`
                                                : tw`bg-gray-700/50 border border-gray-500/50 text-gray-100 mr-8`,
                                        ]}
                                    >
                                        {message.content}
                                    </div>
                                ))
                            )}
                            {sending && <p css={tw`text-xs text-gray-300`}>Thinking...</p>}
                            <div ref={messageEndRef} />
                        </div>

                        <div css={tw`mt-4 grid gap-3`}>
                            <textarea
                                css={tw`w-full rounded-box bg-gray-800/60 border border-gray-600 text-sm text-gray-100 px-3 py-2 min-h-[96px] focus:outline-none focus:border-primary-400`}
                                value={input}
                                onChange={(event) => setInput(event.currentTarget.value)}
                                onKeyDown={onKeyDown}
                                placeholder={'Ask PriyxStudio AI... (Shift+Enter for newline)'}
                                disabled={!config.enabled || sending}
                            />
                            <div css={tw`flex items-center justify-between gap-3`}>
                                <Button type={'button'} isSecondary onClick={() => setMessages([])}>
                                    Clear Chat
                                </Button>
                                <Button type={'button'} disabled={!config.enabled || sending || !input.trim()} onClick={onSend}>
                                    {sending ? 'Sending...' : 'Send'}
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </ServerContentBlock>
    );
};
