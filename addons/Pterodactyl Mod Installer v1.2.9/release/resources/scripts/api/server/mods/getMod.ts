import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (modId: number): Promise<Mod> => {
    return new Promise((resolve, reject) => {
        http.get(`https://modinstaller.fyrehost.net/v1/mods/${modId}`, { withCredentials: false })
            .then(({ data: { data } }) => {
                resolve(data);
            })
            .catch(reject);
    });
};
