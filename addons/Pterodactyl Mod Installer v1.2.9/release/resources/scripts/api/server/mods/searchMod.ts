import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (search: string): Promise<Mod> => {
    return new Promise((resolve, reject) => {
        http.get(
            `https://modinstaller.fyrehost.net/v1/mods/search?gameId=432&pageSize=1&searchFilter=${search}&sortOrder=desc`,
            { withCredentials: false }
        )
            .then(({ data: { data } }) => {
                resolve(data[0]);
            })
            .catch(reject);
    });
};
