import useSWR from 'swr';
import http from '@/api/http';

export interface SplitServerEntry {
    uuid: string;
    uuidShort: string;
    name: string;
    memory: number;
    disk: number;
    cpu: number;
    swap: number;
    split_masteruuid: string | null;
    master?: boolean;
}

export interface SplitData {
    splitted: boolean;
    split_limit: number;
    servers: SplitServerEntry[];
    master: string;
    total: {
        cpu: number;
        disk: number;
        memory: number;
        swap: number;
    };
    totalall: {
        cpu: number;
        disk: number;
        memory: number;
        swap: number;
    };
}

export default (uuid: string) =>
    useSWR([uuid, '/splitted'], async (): Promise<SplitData> => {
        const { data } = await http.get(`/api/client/servers/${uuid}/splitted`);

        return data.data;
    });
