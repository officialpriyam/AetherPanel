import http from '@/api/http';
import { Mod } from '@/components/server/mods/types';

export default (page: number, search: string, category: number): Promise<Mod[]> =>
    new Promise((resolve, reject) => {
        http.get(
            `https://modinstaller.fyrehost.net/v1/mods/search?gameId=432&pageSize=16&index=${page * 16}&searchFilter=${encodeURIComponent(
                search
            )}&sortField=${category}&sortOrder=desc`,
            { withCredentials: false }
        )
            .then(({ data }) => resolve((data?.data || []) as Mod[]))
            .catch(reject);
    });
