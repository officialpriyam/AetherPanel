import http from '@/api/http';
import { ensureCsrfCookie } from '@/api/csrf';
import { LoginResponse } from '@/api/auth/login';

export default (token: string, code: string, recoveryToken?: string): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
        ensureCsrfCookie((process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''))
            .then(() =>
                http.post('/api/auth/login/checkpoint', {
                    confirmation_token: token,
                    authentication_code: code,
                    recovery_token: recoveryToken && recoveryToken.length > 0 ? recoveryToken : undefined,
                })
            )
            .then((response) =>
                resolve({
                    complete: response.data.data.complete,
                    intended: response.data.data.intended || undefined,
                })
            )
            .catch(reject);
    });
};

