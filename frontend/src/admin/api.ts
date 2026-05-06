import axios, { AxiosInstance } from 'axios';
import { attachCsrfProtection } from '@/api/csrf';
import { getFrontendAccessHeaders } from '@/lib/backendAccess';
import { getApiBaseUrl } from '@/lib/runtimeUrls';

export const adminHttp: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    withXSRFToken: true,
    timeout: 20000,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getFrontendAccessHeaders(),
    },
});

attachCsrfProtection(adminHttp);

export const toHuman = (error: any): string => {
    if (error?.response?.status === 419) {
        return 'Your session expired or the CSRF token is invalid. Please try again.';
    }

    if (error.response?.data) {
        let { data } = error.response;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch {
                data = { message: data };
            }
        }

        if (data.errors?.[0]?.detail) {
            return data.errors[0].detail;
        }

        if (typeof data.error === 'string') {
            return data.error;
        }

        if (typeof data.message === 'string') {
            return data.message;
        }
    }

    return error.message || 'Request failed.';
};
