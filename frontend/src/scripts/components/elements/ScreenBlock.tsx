import React from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';

interface BaseProps {
    title: string;
    image: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
    onRetry?: () => void;
    onBack?: never;
}

interface PropsWithBack extends BaseProps {
    onBack?: () => void;
    onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;

const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const ActionButton = styled(Button)`
    ${tw`rounded-full w-8 h-8 flex items-center justify-center p-0`};

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

const ScreenBlock = ({ title, image, message, onBack, onRetry }: ScreenBlockProps) => (
    <PageContentBlock>
        <div css={tw`flex justify-center`}>
            <div
                css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 bg-neutral-100 rounded-lg shadow-lg text-center relative`}
            >
                {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                    <div css={tw`absolute left-0 top-0 ml-4 mt-4`}>
                        <ActionButton
                            onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                            className={onRetry ? 'hover:spin' : undefined}
                        >
                            <FontAwesomeIcon icon={onRetry ? faSyncAlt : faArrowLeft} />
                        </ActionButton>
                    </div>
                )}
                <img src={image} css={tw`w-2/3 h-auto select-none mx-auto`} />
                <h2 css={tw`mt-10 text-neutral-900 font-bold text-4xl`}>{title}</h2>
                <p css={tw`text-sm text-neutral-700 mt-2`}>{message}</p>
            </div>
        </div>
    </PageContentBlock>
);

type ServerErrorProps = (Omit<PropsWithBack, 'image' | 'title'> | Omit<PropsWithRetry, 'image' | 'title'>) & {
    title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
    <ScreenBlock title={title || 'Something went wrong'} image={ServerErrorSvg} {...props} />
);

const NotFound = ({ title, message, onBack }: Partial<Pick<ScreenBlockProps, 'title' | 'message' | 'onBack'>>) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <PageContentBlock>
            <div css={tw`flex justify-center`}>
                <section
                    css={tw`w-full max-w-5xl overflow-hidden rounded-box border border-gray-500/60 backdrop-blur-md shadow-2xl`}
                    style={{
                        boxShadow: '0 30px 80px -32px rgb(0 0 0 / 0.55)',
                        background:
                            'radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 26%, transparent), transparent 32%), linear-gradient(145deg, color-mix(in srgb, var(--surfaceCard) 92%, transparent), color-mix(in srgb, var(--surfaceOverlay) 88%, var(--surfaceBase)))',
                    }}
                >
                    <div css={tw`grid gap-0 lg:grid-cols-[1.2fr,0.8fr]`}>
                        <div css={tw`px-8 py-10 md:px-12 md:py-12`}>
                            <div
                                css={tw`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
                                style={{
                                    borderColor: 'color-mix(in srgb, var(--primary) 36%, transparent)',
                                    background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                                    color: 'var(--gray100)',
                                }}
                            >
                                Error 404
                            </div>

                            <h2 css={tw`mt-5 text-4xl font-bold text-gray-50 md:text-6xl`}>
                                {title || 'Route not found'}
                            </h2>

                            <p css={tw`mt-4 max-w-2xl text-sm leading-6 text-gray-200 md:text-base`}>
                                {message || 'The page you requested is not available here anymore, or the link was never valid for this panel route.'}
                            </p>

                            {currentPath && (
                                <div
                                    css={tw`mt-5 inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs text-gray-200`}
                                    style={{
                                        borderColor: 'color-mix(in srgb, var(--borderStrong) 88%, transparent)',
                                        background: 'color-mix(in srgb, var(--surfaceOverlay) 80%, transparent)',
                                    }}
                                >
                                    <span css={tw`mr-2 text-gray-400`}>Requested path</span>
                                    <span css={tw`truncate font-medium text-gray-100`}>{currentPath}</span>
                                </div>
                            )}

                            <div css={tw`mt-8 flex flex-wrap items-center gap-3`}>
                                <Button
                                    type={'button'}
                                    onClick={() => (onBack ? onBack() : window.history.length > 1 ? window.history.back() : (window.location.href = '/'))}
                                >
                                    Go Back
                                </Button>
                                <Button type={'button'} isSecondary onClick={() => (window.location.href = '/')}>
                                    Dashboard
                                </Button>
                                <Button type={'button'} isSecondary onClick={() => (window.location.href = '/auth/login')}>
                                    Sign In
                                </Button>
                            </div>

                            <div css={tw`mt-8 grid gap-3 text-left text-sm text-gray-200 md:grid-cols-3`}>
                                <div>
                                    <div css={tw`font-semibold text-gray-50`}>Check the address</div>
                                    <div css={tw`mt-1 text-gray-400`}>A copied link or stale bookmark can land on an invalid route.</div>
                                </div>
                                <div>
                                    <div css={tw`font-semibold text-gray-50`}>Return to a known screen</div>
                                    <div css={tw`mt-1 text-gray-400`}>Use the dashboard entrypoint to continue from a valid panel location.</div>
                                </div>
                                <div>
                                    <div css={tw`font-semibold text-gray-50`}>Re-enter through login</div>
                                    <div css={tw`mt-1 text-gray-400`}>If the link came from an expired session, sign in again and retry from navigation.</div>
                                </div>
                            </div>
                        </div>

                        <div
                            css={tw`flex items-center justify-center border-t border-gray-500/30 px-6 py-8 lg:border-l lg:border-t-0`}
                            style={{
                                background:
                                    'linear-gradient(180deg, color-mix(in srgb, var(--surfaceOverlay) 88%, transparent), color-mix(in srgb, var(--gray900) 92%, transparent))',
                            }}
                        >
                            <div css={tw`w-full max-w-sm`}>
                                <div
                                    css={tw`rounded-box border border-gray-500/40 p-5`}
                                    style={{
                                        background:
                                            'radial-gradient(circle at top, color-mix(in srgb, var(--primary) 18%, transparent), transparent 42%), color-mix(in srgb, var(--surfaceCard) 84%, transparent)',
                                    }}
                                >
                                    <img src={NotFoundSvg} css={tw`mx-auto h-auto w-full max-w-xs select-none`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageContentBlock>
    );
};

export { ServerError, NotFound };
export default ScreenBlock;
