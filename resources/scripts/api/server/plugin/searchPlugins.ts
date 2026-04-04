import http from '@/api/http';
import { Plugin, Source } from '@/components/server/plugin/types';

const PER_PAGE = 16;

const toNumber = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => String(entry));
};

export default (search: string, source: Source, page: number): Promise<Plugin[]> =>
    new Promise((resolve, reject) => {
        if (source === Source.Spigot) {
            let url = `https://spigot.fyrehost.net/v2/resources?size=${PER_PAGE}&sort=-downloads&page=${page}`;

            if (search.trim().length > 0) {
                url = `https://spigot.fyrehost.net/v2/search/resources/${encodeURIComponent(search)}?size=${PER_PAGE}&page=${page}&fields=price`;
            }

            http.get(url, { withCredentials: false })
                .then(({ data }) => {
                    const rows = Array.isArray(data) ? data : [];

                    resolve(
                        rows.map((plugin: any) => ({
                            id: plugin.id,
                            name: String(plugin.name || 'Unknown Plugin'),
                            summary: String(plugin.tag || ''),
                            premium: !!plugin.premium,
                            external: plugin.file?.type === 'external' || !!plugin.external,
                            canDownload: !plugin.premium,
                            externalUrl: plugin.file?.externalUrl || plugin.file?.external_url,
                            rating: {
                                average: toNumber(plugin.rating?.average),
                            },
                            icon: plugin.icon?.url,
                            testedVersions: toStringArray(plugin.testedVersions),
                            price: toNumber(plugin.price),
                            currency: String(plugin.currency || ''),
                            versionId: plugin.version?.id ?? 0,
                            downloads: toNumber(plugin.downloads),
                            source: Source.Spigot,
                        }))
                    );
                })
                .catch(reject);

            return;
        }

        if (source === Source.Polymart) {
            const start = (page - 1) * PER_PAGE + 1;
            const query = search.trim();
            const base = `https://api.polymart.org/v1/search?limit=${PER_PAGE}&start=${start}`;
            const url = query.length > 0 ? `${base}&query=${encodeURIComponent(query)}` : base;

            http.post(url, {}, { withCredentials: false })
                .then(({ data }) => {
                    const result = Array.isArray(data?.response?.result) ? data.response.result : [];

                    resolve(
                        result.map((resource: any) => ({
                            id: resource.id,
                            name: String(resource.title || resource.name || 'Unknown Plugin'),
                            summary: String(resource.subtitle || ''),
                            premium: toNumber(resource.price) > 0,
                            external: true,
                            canDownload: !!resource.canDownload,
                            externalUrl: resource.url,
                            rating: {
                                average: toNumber(resource.reviews?.stars),
                            },
                            icon: resource.thumbnailURL,
                            testedVersions: toStringArray(resource.supportedMinecraftVersions),
                            price: toNumber(resource.price),
                            currency: String(resource.currency || ''),
                            versionId: resource.updates?.latest?.id ?? 0,
                            downloads: toNumber(resource.downloads),
                            source: Source.Polymart,
                        }))
                    );
                })
                .catch(reject);

            return;
        }

        const offset = (page - 1) * PER_PAGE;
        const url = `https://modrinth.fyrehost.net/v2/search?index=downloads&offset=${offset}&limit=${PER_PAGE}&query=${encodeURIComponent(
            search
        )}&facets=[["project_type:plugin"]]`;

        http.get(url, { withCredentials: false })
            .then(({ data }) => {
                const hits = Array.isArray(data?.hits) ? data.hits : [];

                resolve(
                    hits.map((entry: any) => ({
                        id: entry.project_id,
                        name: String(entry.title || 'Unknown Plugin'),
                        summary: String(entry.description || ''),
                        premium: false,
                        external: false,
                        canDownload: true,
                        externalUrl: `https://modrinth.com/plugin/${entry.slug}`,
                        rating: {
                            average: -1,
                        },
                        icon: entry.icon_url,
                        testedVersions: toStringArray(entry.versions),
                        price: 0,
                        currency: '',
                        versionId: entry.latest_version || '',
                        downloads: toNumber(entry.downloads),
                        source: Source.Modrinth,
                    }))
                );
            })
            .catch(reject);
    });
