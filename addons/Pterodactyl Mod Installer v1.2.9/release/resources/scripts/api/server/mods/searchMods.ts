import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (page: number, search: string, category: number): Promise<Mod[]> => {
    return new Promise((resolve, reject) => {
        http.get(
            `https://modinstaller.fyrehost.net/v1/mods/search?gameId=432&pageSize=16&index=${
                page * 16
            }&searchFilter=${search}&sortField=${category}&sortOrder=desc`,
            { withCredentials: false }
        )
            .then(({ data: { data } }) => {
                resolve(data);
            })
            .catch(reject);
    });
};
