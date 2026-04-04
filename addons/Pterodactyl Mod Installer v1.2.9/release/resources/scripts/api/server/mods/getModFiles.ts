import http from '@/api/http';
import { ModFile } from '@/components/server/mods/types';

export default (modId: number, gameVersion = ''): Promise<ModFile[]> => {
    return new Promise((resolve, reject) => {
        http.get(`https://modinstaller.fyrehost.net/v1/mods/${modId}/files?gameVersion=${gameVersion}`, {
            withCredentials: false,
        })
            .then(({ data: { data } }) => {
                resolve(data);
            })
            .catch(reject);
    });
};
