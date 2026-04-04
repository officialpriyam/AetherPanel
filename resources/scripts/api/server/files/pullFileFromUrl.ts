import http from '@/api/http';

export interface PullFileFromUrlOptions {
    filename?: string;
    useHeader?: boolean;
    foreground?: boolean;
}

export default (uuid: string, url: string, directory: string, options: PullFileFromUrlOptions = {}): Promise<void> =>
    new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/files/pull`, {
            url,
            directory,
            filename: options.filename,
            use_header: options.useHeader,
            foreground: options.foreground,
        })
            .then(() => resolve())
            .catch(reject);
    });
