import http from '@/api/http';
import { MinecraftVersionBuilds } from './types';

export default async (uuid: string, type: string): Promise<MinecraftVersionBuilds[]> => {
    const { data } = await http.get<{ builds: Record<string, Omit<MinecraftVersionBuilds, 'version'>> }>(
        `/api/client/servers/${uuid}/minecraft/versions/types/${type.toUpperCase()}`
    );

    return Object.entries(data.builds || {})
        .map(([version, row]) => ({ ...row, version }))
        .reverse();
};
