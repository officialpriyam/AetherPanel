import http from '@/api/http';
import { Plugin, Source } from '@/components/server/plugin/types';

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

export default (id: number | string, source: Source): Promise<Plugin | undefined> =>
    new Promise((resolve, reject) => {
        if (source === Source.Spigot) {
            http.get(`https://spigot.fyrehost.net/v2/resources/${id}`, { withCredentials: false })
                .then(({ data }) => {
                    resolve({
                        id: data.id,
                        name: String(data.name || 'Unknown Plugin'),
                        summary: String(data.tag || ''),
                        premium: !!data.premium,
                        external: !!data.external,
                        canDownload: !data.premium,
                        externalUrl: data.file?.externalUrl,
                        rating: {
                            average: toNumber(data.rating?.average),
                        },
                        icon: data.icon?.url,
                        testedVersions: toStringArray(data.testedVersions),
                        price: toNumber(data.price),
                        currency: String(data.currency || ''),
                        versionId: data.version?.id ?? 0,
                        downloads: toNumber(data.downloads),
                        source: Source.Spigot,
                    });
                })
                .catch(reject);

            return;
        }

        if (source === Source.Polymart) {
            http.get(`https://api.polymart.org/v1/getResourceInfo?resource_id=${id}`, { withCredentials: false })
                .then(({ data }) => {
                    const resource = data?.response?.resource;

                    if (!resource) {
                        resolve(undefined);
                        return;
                    }

                    resolve({
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
                    });
                })
                .catch(reject);

            return;
        }

        http.get(`https://modrinth.fyrehost.net/v2/project/${id}`, { withCredentials: false })
            .then(({ data }) => {
                resolve({
                    id: data.id,
                    name: String(data.title || 'Unknown Plugin'),
                    summary: String(data.description || ''),
                    premium: false,
                    external: false,
                    canDownload: true,
                    externalUrl: `https://modrinth.com/plugin/${data.slug || data.id}`,
                    rating: {
                        average: -1,
                    },
                    icon: data.icon_url,
                    testedVersions: toStringArray(data.versions),
                    price: 0,
                    currency: '',
                    versionId: data.latest_version || '',
                    downloads: toNumber(data.downloads),
                    source: Source.Modrinth,
                });
            })
            .catch(reject);
    });
