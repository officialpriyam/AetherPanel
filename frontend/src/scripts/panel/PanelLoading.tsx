type PanelLoadingProps = {
    ariaLabel?: string;
    embedded?: boolean;
};

function LoadingArtwork() {
    return (
        <>
            <style>{`
                .panel-loading-screen {
                    position: relative;
                    min-height: 100vh;
                    width: 100%;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background: #05080b;
                    color: #eef2ff;
                    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .panel-loading-screen--embedded {
                    min-height: 260px;
                    border-radius: 18px;
                    border: 1px solid rgba(148, 163, 184, 0.16);
                }

                .panel-loading-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 14px;
                    transform: translateY(-6px);
                }

                .panel-loading-ring {
                    width: 31px;
                    height: 31px;
                    border-radius: 999px;
                    border: 3px solid rgba(124, 58, 237, 0.15);
                    border-top-color: #8b5cf6;
                    border-right-color: #8b5cf6;
                    animation: panel-loading-spin 0.86s linear infinite;
                }

                .panel-loading-streak {
                    position: absolute;
                    z-index: 1;
                    width: min(34vw, 380px);
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), rgba(190, 205, 255, 0.86), transparent);
                    box-shadow: 0 0 12px rgba(124, 58, 237, 0.42);
                    opacity: 0;
                    pointer-events: none;
                }

                .panel-loading-streak::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 12px;
                    height: 12px;
                    border-top: 2px solid rgba(238, 242, 255, 0.92);
                    border-right: 2px solid rgba(238, 242, 255, 0.92);
                    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.55));
                }

                .panel-loading-streak--left::after,
                .panel-loading-streak--top::after {
                    right: 0;
                    transform: translate(30%, -50%) rotate(45deg);
                }

                .panel-loading-streak--right::after,
                .panel-loading-streak--bottom::after {
                    left: 0;
                    transform: translate(-30%, -50%) rotate(-135deg);
                }

                .panel-loading-streak--left {
                    left: -36vw;
                    top: 50%;
                    animation: panel-loading-streak-left 3.2s ease-in-out infinite;
                }

                .panel-loading-streak--right {
                    right: -36vw;
                    top: 50%;
                    animation: panel-loading-streak-right 3.2s ease-in-out infinite 0.38s;
                }

                .panel-loading-streak--top {
                    left: 50%;
                    top: -28vh;
                    transform: translateX(-50%) rotate(90deg);
                    animation: panel-loading-streak-top 3.2s ease-in-out infinite 0.76s;
                }

                .panel-loading-streak--bottom {
                    left: 50%;
                    bottom: -28vh;
                    transform: translateX(-50%) rotate(90deg);
                    animation: panel-loading-streak-bottom 3.2s ease-in-out infinite 1.14s;
                }

                .panel-loading-spark {
                    position: absolute;
                    z-index: 1;
                    left: 50%;
                    top: 50%;
                    width: 34px;
                    height: 34px;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    animation: panel-loading-spark 3.2s ease-in-out infinite 1.2s;
                    pointer-events: none;
                }

                .panel-loading-spark::before,
                .panel-loading-spark::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 2px;
                    height: 34px;
                    border-radius: 999px;
                    background: linear-gradient(180deg, transparent, rgba(238, 242, 255, 0.9), transparent);
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.42);
                }

                .panel-loading-spark::after {
                    transform: translate(-50%, -50%) rotate(90deg);
                }

                @keyframes panel-loading-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes panel-loading-streak-left {
                    0%, 8% {
                        transform: translate3d(0, 0, 0) scaleX(0.36);
                        opacity: 0;
                    }
                    34% {
                        opacity: 0.8;
                    }
                    72%, 100% {
                        transform: translate3d(52vw, 0, 0) scaleX(1);
                        opacity: 0;
                    }
                }

                @keyframes panel-loading-streak-right {
                    0%, 8% {
                        transform: translate3d(0, 0, 0) scaleX(0.36);
                        opacity: 0;
                    }
                    34% {
                        opacity: 0.8;
                    }
                    72%, 100% {
                        transform: translate3d(-52vw, 0, 0) scaleX(1);
                        opacity: 0;
                    }
                }

                @keyframes panel-loading-streak-top {
                    0%, 8% {
                        transform: translateX(-50%) translateY(0) rotate(90deg) scaleX(0.36);
                        opacity: 0;
                    }
                    34% {
                        opacity: 0.8;
                    }
                    72%, 100% {
                        transform: translateX(-50%) translateY(52vh) rotate(90deg) scaleX(1);
                        opacity: 0;
                    }
                }

                @keyframes panel-loading-streak-bottom {
                    0%, 8% {
                        transform: translateX(-50%) translateY(0) rotate(90deg) scaleX(0.36);
                        opacity: 0;
                    }
                    34% {
                        opacity: 0.8;
                    }
                    72%, 100% {
                        transform: translateX(-50%) translateY(-52vh) rotate(90deg) scaleX(1);
                        opacity: 0;
                    }
                }

                @keyframes panel-loading-spark {
                    0%, 56%, 100% {
                        transform: translate(-50%, -50%) scale(0.65) rotate(0deg);
                        opacity: 0;
                    }
                    64% {
                        opacity: 0.72;
                    }
                    74% {
                        transform: translate(-50%, -50%) scale(1.05) rotate(35deg);
                        opacity: 0;
                    }
                }
            `}</style>
            <span className={'panel-loading-streak panel-loading-streak--left'} aria-hidden={'true'} />
            <span className={'panel-loading-streak panel-loading-streak--right'} aria-hidden={'true'} />
            <span className={'panel-loading-streak panel-loading-streak--top'} aria-hidden={'true'} />
            <span className={'panel-loading-streak panel-loading-streak--bottom'} aria-hidden={'true'} />
            <span className={'panel-loading-spark'} aria-hidden={'true'} />
            <div className={'panel-loading-content'} aria-hidden={'true'}>
                <div className={'panel-loading-ring'} />
            </div>
        </>
    );
}

export default function PanelLoading({ ariaLabel = 'Loading panel', embedded = false }: PanelLoadingProps) {
    const className = embedded ? 'panel-loading-screen panel-loading-screen--embedded' : 'panel-loading-screen';

    if (embedded) {
        return (
            <div className={className} role={'status'} aria-live={'polite'} aria-label={ariaLabel}>
                <LoadingArtwork />
            </div>
        );
    }

    return (
        <main className={className} role={'status'} aria-live={'polite'} aria-label={ariaLabel}>
            <LoadingArtwork />
        </main>
    );
}
