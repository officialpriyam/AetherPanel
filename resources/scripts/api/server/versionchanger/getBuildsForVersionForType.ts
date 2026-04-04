import http from '@/api/http';
import { MinecraftVersionBuild } from './types';

export default async (uuid: string, type: string, version: string): Promise<MinecraftVersionBuild[]> => {
    const { data } = await http.get<{ builds: MinecraftVersionBuild[] }>(
        `/api/client/servers/${uuid}/minecraft/versions/types/${type.toUpperCase()}/${version}`
    );

    return data.builds || [];
};
