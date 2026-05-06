import http from '@/api/http';
import getVersions from '@/api/server/plugin/getVersions';
import { Plugin, Source } from '@/components/server/plugin/types';

export default (
    plugin: Plugin,
    id: number | string,
    source: Source,
    version: number | string = -1,
    token: string | null = null
): Promise<string> =>
    new Promise((resolve, reject) => {
        if (source === Source.Spigot) {
            if (version !== -1) {
                resolve(`https://spigotmc.org/resources/${id}/download?version=${version}`);
                return;
            }

            resolve(`https://cdn.spiget.org/file/spiget-resources/${id}.jar`);
            return;
        }

        if (source === Source.Polymart) {
            if (version !== -1) {
                resolve(`https://polymart.org/r/${id}/updates?update=${version}`);
                return;
            }

            const payload: Record<string, number | string> = { resource_id: id };
            if (token) {
                payload.token = token;
            }

            http.post('https://api.polymart.org/v1/getDownloadURL', payload, { withCredentials: false })
                .then(({ data }) => {
                    resolve(String(data?.response?.result?.url || plugin.externalUrl || ''));
                })
                .catch(reject);

            return;
        }

        getVersions(plugin)
            .then((versions) => {
                const latest = versions[0];
                resolve(latest?.downloadUrl || '');
            })
            .catch(reject);
    });
