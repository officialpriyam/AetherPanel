export interface MinecraftVersionProviderType {
    name: string;
    icon: string;
    homepage: string;
    description: string;
    experimental: boolean;
    deprecated: boolean;
    builds: number;
    versions: {
        minecraft: number;
        project: number;
    };
}

export interface MinecraftVersionBuild {
    id: number;
    type: string;
    projectVersionId: string | null;
    versionId: string | null;
    buildNumber: number;
    experimental: boolean;
    created: string | null;
}

export interface MinecraftVersionBuilds {
    version: string;
    type?: 'RELEASE' | 'SNAPSHOT';
    builds: number;
    latest: MinecraftVersionBuild;
}

export interface InstalledVersionState {
    build: MinecraftVersionBuild;
    latest: MinecraftVersionBuild;
}
