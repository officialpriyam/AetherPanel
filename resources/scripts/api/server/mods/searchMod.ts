import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (search: string): Promise<Mod | undefined> =>
    new Promise((resolve, reject) => {
        http.get(
            `https://modinstaller.fyrehost.net/v1/mods/search?gameId=432&pageSize=1&searchFilter=${encodeURIComponent(
                search
            )}&sortOrder=desc`,
            { withCredentials: false }
        )
            .then(({ data }) => {
                const rows = data?.data;
                resolve(Array.isArray(rows) ? (rows[0] as Mod | undefined) : undefined);
            })
            .catch(reject);
    });
