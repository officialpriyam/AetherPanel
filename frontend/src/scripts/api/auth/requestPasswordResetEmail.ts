import http from '@/api/http';
import { ensureCsrfCookie } from '@/api/csrf';

export default (email: string, recaptchaData?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        ensureCsrfCookie((process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''))
            .then(() => http.post('/api/auth/password', { email, 'g-recaptcha-response': recaptchaData }))
            .then((response) => resolve(response.data.status || ''))
            .catch(reject);
    });
};

