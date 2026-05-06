import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (modId: number): Promise<Mod> =>
    new Promise((resolve, reject) => {
        http.get(`https://modinstaller.fyrehost.net/v1/mods/${modId}`, { withCredentials: false })
            .then(({ data }) => resolve(data?.data as Mod))
            .catch(reject);
    });
