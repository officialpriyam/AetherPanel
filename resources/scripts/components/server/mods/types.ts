export interface Mod {
    id: number;
    name: string;
    slug: string;
    summary: string;
    downloadCount: number;
    links: {
        websiteUrl?: string;
    };
    logo: {
        thumbnailUrl?: string;
        url?: string;
    } | null;
    latestFilesIndexes?: Array<{
        gameVersion: string;
    }>;
}

export interface ModFile {
    id: number;
    displayName: string;
    downloadCount: number;
    downloadUrl: string;
    dependencies: Array<{
        modId: number;
        relationType: number;
    }>;
}
