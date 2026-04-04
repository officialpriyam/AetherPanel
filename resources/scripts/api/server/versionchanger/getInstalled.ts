import http from '@/api/http';
import { InstalledVersionState } from './types';

export default async (uuid: string): Promise<InstalledVersionState | null> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/minecraft/versions/installed`);

    return data.build ? data : null;
};
