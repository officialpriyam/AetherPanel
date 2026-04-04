import http from '@/api/http';
import { ModFile } from '@/components/server/mods/types';

export default (modId: number, gameVersion = ''): Promise<ModFile[]> =>
    new Promise((resolve, reject) => {
        http.get(`https://modinstaller.fyrehost.net/v1/mods/${modId}/files?gameVersion=${encodeURIComponent(gameVersion)}`, {
            withCredentials: false,
        })
            .then(({ data }) => resolve((data?.data || []) as ModFile[]))
            .catch(reject);
    });
