import Link from 'next/link';

export default function NotFound() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
            }}
        >
            <section
                style={{
                    width: '100%',
                    maxWidth: '980px',
                    overflow: 'hidden',
                    borderRadius: '18px',
                    border: '1px solid color-mix(in srgb, var(--borderStrong) 72%, transparent)',
                    boxShadow: '0 30px 80px -32px rgb(0 0 0 / 0.55)',
                    background:
                        'radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 26%, transparent), transparent 32%), linear-gradient(145deg, color-mix(in srgb, var(--surfaceCard) 92%, transparent), color-mix(in srgb, var(--surfaceOverlay) 88%, var(--surfaceBase)))',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gap: '0',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    }}
                >
                    <div style={{ padding: '48px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '999px',
                                border: '1px solid color-mix(in srgb, var(--primary) 36%, transparent)',
                                background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                                color: 'var(--gray100)',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                padding: '8px 12px',
                            }}
                        >
                            Error 404
                        </div>

                        <h1
                            style={{
                                margin: '20px 0 0',
                                color: 'var(--gray50)',
                                fontSize: 'clamp(42px, 7vw, 72px)',
                                lineHeight: 1,
                            }}
                        >
                            Route not found
                        </h1>

                        <p
                            style={{
                                margin: '18px 0 0',
                                maxWidth: '560px',
                                color: 'var(--gray200)',
                                fontSize: '16px',
                                lineHeight: 1.7,
                            }}
                        >
                            The requested page is not available on this panel route. Use a known entrypoint and continue from navigation.
                        </p>

                        <div
                            style={{
                                marginTop: '28px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                            }}
                        >
                            <Link
                                href="/"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    padding: '12px 18px',
                                    border: '1px solid color-mix(in srgb, var(--primary) 82%, #000)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                }}
                            >
                                Open Dashboard
                            </Link>
                            <Link
                                href="/auth/login"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    padding: '12px 18px',
                                    border: '1px solid color-mix(in srgb, var(--borderStrong) 72%, transparent)',
                                    background: 'transparent',
                                    color: 'var(--gray100)',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                }}
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    <div
                        style={{
                            borderLeft: '1px solid color-mix(in srgb, var(--borderColor) 62%, transparent)',
                            background:
                                'linear-gradient(180deg, color-mix(in srgb, var(--surfaceOverlay) 88%, transparent), color-mix(in srgb, var(--gray900) 92%, transparent))',
                            padding: '48px 32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                borderRadius: '16px',
                                border: '1px solid color-mix(in srgb, var(--borderStrong) 58%, transparent)',
                                background:
                                    'radial-gradient(circle at top, color-mix(in srgb, var(--primary) 18%, transparent), transparent 42%), color-mix(in srgb, var(--surfaceCard) 84%, transparent)',
                                padding: '28px',
                            }}
                        >
                            <div
                                style={{
                                    color: 'var(--gray50)',
                                    fontSize: '84px',
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    textAlign: 'center',
                                }}
                            >
                                404
                            </div>
                            <div
                                style={{
                                    marginTop: '16px',
                                    color: 'var(--gray300)',
                                    fontSize: '14px',
                                    lineHeight: 1.7,
                                    textAlign: 'center',
                                }}
                            >
                                Check the address, return to the dashboard, or re-enter through the login page.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
