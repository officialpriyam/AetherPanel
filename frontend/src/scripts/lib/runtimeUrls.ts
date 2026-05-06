const normalizeUrl = (value?: string | null): string => (value || '').trim().replace(/\/$/, '');

export const getRuntimeOrigin = (): string => {
    if (typeof window !== 'undefined' && typeof window.location?.origin === 'string') {
        return normalizeUrl(window.location.origin);
    }

    return normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || '');
};

export const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        return getRuntimeOrigin();
    }

    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || '');
};

export const buildRuntimeUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const origin = getApiBaseUrl();

    return origin ? `${origin}${normalizedPath}` : normalizedPath;
};
