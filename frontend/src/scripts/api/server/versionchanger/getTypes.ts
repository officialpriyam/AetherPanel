import http from '@/api/http';
import { MinecraftVersionProviderType } from './types';

export default async (uuid: string): Promise<MinecraftVersionProviderType[]> => {
    const { data } = await http.get<{ types: Record<string, MinecraftVersionProviderType> }>(
        `/api/client/servers/${uuid}/minecraft/versions/types`
    );

    return Object.values(data.types || {});
};
