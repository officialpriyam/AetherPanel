import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getFrontendAccessHeaders } from '@/lib/backendAccess';

const mutatingMethods = new Set(['post', 'put', 'patch', 'delete']);
const pendingCsrfRequests = new Map<string, Promise<void>>();

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _csrfRetried?: boolean;
};

const defaultHeaders = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...getFrontendAccessHeaders(),
};

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefix = `${name}=`;
    const match = document.cookie
        .split(';')
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith(prefix));

    return match ? match.slice(prefix.length) : null;
};

const shouldEnsureCsrfCookie = (config: InternalAxiosRequestConfig, client: AxiosInstance): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    if ((config.withCredentials ?? client.defaults.withCredentials ?? true) === false) {
        return false;
    }

    const method = (config.method ?? 'get').toLowerCase();
    if (!mutatingMethods.has(method)) {
        return false;
    }

    const url = config.url ?? '';
    return !url.endsWith('/sanctum/csrf-cookie');
};

export const ensureCsrfCookie = async (baseURL: string, forceRefresh = false): Promise<void> => {
    const normalizedBaseUrl = normalizeBaseUrl(baseURL);

    if (typeof window === 'undefined' || normalizedBaseUrl.length === 0) {
        return;
    }

    if (!forceRefresh && readCookie('XSRF-TOKEN')) {
        return;
    }

    const existingRequest = pendingCsrfRequests.get(normalizedBaseUrl);
    if (existingRequest) {
        return existingRequest;
    }

    const request = axios.get(`${normalizedBaseUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
        headers: defaultHeaders,
    }).then(() => undefined).finally(() => {
        if (pendingCsrfRequests.get(normalizedBaseUrl) === request) {
            pendingCsrfRequests.delete(normalizedBaseUrl);
        }
    });

    pendingCsrfRequests.set(normalizedBaseUrl, request);
    return request;
};

export const attachCsrfProtection = (client: AxiosInstance): void => {
    client.defaults.withCredentials = true;
    client.defaults.xsrfCookieName = 'XSRF-TOKEN';
    client.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
    client.defaults.withXSRFToken = true;

    client.interceptors.request.use(async (config) => {
        if (shouldEnsureCsrfCookie(config, client)) {
            await ensureCsrfCookie(String(config.baseURL ?? client.defaults.baseURL ?? ''));
        }

        return config;
    });

    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config as RetryableRequestConfig | undefined;

            if (
                error.response?.status === 419 &&
                config &&
                !config._csrfRetried &&
                shouldEnsureCsrfCookie(config, client)
            ) {
                config._csrfRetried = true;
                await ensureCsrfCookie(String(config.baseURL ?? client.defaults.baseURL ?? ''), true);

                return client(config);
            }

            throw error;
        }
    );
};
