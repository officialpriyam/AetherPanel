import http from '@/api/http';
import { ensureCsrfCookie } from '@/api/csrf';
import { getApiBaseUrl } from '@/lib/runtimeUrls';

interface Data {
    token: string;
    password: string;
    passwordConfirmation: string;
}

interface PasswordResetResponse {
    redirectTo?: string | null;
    sendToLogin: boolean;
}

export default (email: string, data: Data): Promise<PasswordResetResponse> => {
    return new Promise((resolve, reject) => {
        ensureCsrfCookie(getApiBaseUrl())
            .then(() =>
                http.post('/api/auth/password/reset', {
                    email,
                    token: data.token,
                    password: data.password,
                    password_confirmation: data.passwordConfirmation,
                })
            )
            .then((response) =>
                resolve({
                    redirectTo: response.data.redirect_to,
                    sendToLogin: response.data.send_to_login,
                })
            )
            .catch(reject);
    });
};

