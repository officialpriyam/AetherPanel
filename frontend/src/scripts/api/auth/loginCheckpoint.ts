import http from '@/api/http';
import { ensureCsrfCookie } from '@/api/csrf';
import { LoginResponse } from '@/api/auth/login';
import { getApiBaseUrl } from '@/lib/runtimeUrls';

export default (token: string, code: string, recoveryToken?: string): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
        ensureCsrfCookie(getApiBaseUrl())
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

