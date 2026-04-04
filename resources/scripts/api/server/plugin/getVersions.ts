import http from '@/api/http';
import { Plugin, Source, Version } from '@/components/server/plugin/types';

const toNumber = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
};

export default (plugin: Plugin): Promise<Version[]> =>
    new Promise((resolve, reject) => {
        if (plugin.source === Source.Spigot) {
            http.get(`https://spigot.fyrehost.net/v2/resources/${plugin.id}/versions?sort=-id`, { withCredentials: false })
                .then(({ data }) => {
                    const rows = Array.isArray(data) ? data : [];

                    resolve(
                        rows.map((version: any) => ({
                            id: version.id,
                            name: String(version.name || `Version ${version.id}`),
                            downloads: toNumber(version.downloads),
                            description: '',
                            externalUrl: `https://spigotmc.org/resources/${plugin.id}/download?version=${version.id}`,
                            downloadUrl: `https://spigotmc.org/resources/${plugin.id}/download?version=${version.id}`,
                        }))
                    );
                })
                .catch(reject);

            return;
        }

        if (plugin.source === Source.Polymart) {
            http.get(`https://api.polymart.org/v1/getResourceUpdates?resource_id=${plugin.id}`, { withCredentials: false })
                .then(({ data }) => {
                    const rows = Array.isArray(data?.response?.updates) ? data.response.updates : [];

                    resolve(
                        rows.map((update: any) => ({
                            id: update.id,
                            name: String(update.title || `Update ${update.id}`),
                            downloads: toNumber(update.downloads),
                            description: String(update.description || ''),
                            externalUrl: String(update.url || plugin.externalUrl || ''),
                        }))
                    );
                })
                .catch(reject);

            return;
        }

        http.get(`https://modrinth.fyrehost.net/v2/project/${plugin.id}/version`, { withCredentials: false })
            .then(({ data }) => {
                const rows = Array.isArray(data) ? data : [];

                resolve(
                    rows.map((version: any) => ({
                        id: version.id,
                        name: String(version.name || version.id),
                        downloads: toNumber(version.downloads),
                        description: String(version.changelog || ''),
                        downloadUrl: version.files?.[0]?.url,
                        externalUrl: `https://modrinth.com/plugin/${plugin.id}/version/${version.id}`,
                    }))
                );
            })
            .catch(reject);
    });
