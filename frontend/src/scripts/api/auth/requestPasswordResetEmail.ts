import http from '@/api/http';
import { ensureCsrfCookie } from '@/api/csrf';
import { getApiBaseUrl } from '@/lib/runtimeUrls';

export default (email: string, recaptchaData?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        ensureCsrfCookie(getApiBaseUrl())
            .then(() => http.post('/api/auth/password', { email, 'g-recaptcha-response': recaptchaData }))
            .then((response) => resolve(response.data.status || ''))
            .catch(reject);
    });
};

