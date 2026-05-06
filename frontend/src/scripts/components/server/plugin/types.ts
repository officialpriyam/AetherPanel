export enum Source {
    Spigot = 'spigot',
    Polymart = 'polymart',
    Modrinth = 'modrinth',
}

export interface Plugin {
    id: number | string;
    name: string;
    summary: string;
    premium: boolean;
    external: boolean;
    canDownload: boolean;
    externalUrl?: string;
    rating: {
        average: number;
    };
    icon?: string;
    testedVersions: string[];
    price: number;
    currency: string;
    versionId: number | string;
    currentVersionId?: number | string;
    downloads: number;
    source: Source;
}

export interface Version {
    id: number | string;
    name: string;
    downloads: number;
    description?: string;
    downloadUrl?: string;
    externalUrl?: string;
}

export interface InstalledPlugin {
    fileName: string;
    id: string;
    source: Source;
    versionId: string;
}

export const pruneFileName = (name: string): string =>
    name
        .replace(/[^a-zA-Z0-9- ]/g, '')
        .split(' ')
        .join('');

export const parseInstalledPlugin = (fileName: string): InstalledPlugin | null => {
    if (!fileName.toLowerCase().endsWith('.jar')) {
        return null;
    }

    const noExt = fileName.replace(/\.jar$/i, '');
    const parts = noExt.split('-');

    if (parts.length < 3) {
        return null;
    }

    const versionId = parts.pop() || '';
    const sourceAndId = parts.pop() || '';

    const sourceKey = sourceAndId.substring(0, 1).toUpperCase();
    const id = sourceAndId.substring(1);

    if (!id) {
        return null;
    }

    const source = sourceKey === 'P' ? Source.Polymart : sourceKey === 'M' ? Source.Modrinth : sourceKey === 'S' ? Source.Spigot : null;

    if (!source) {
        return null;
    }

    return {
        fileName,
        id,
        source,
        versionId,
    };
};
