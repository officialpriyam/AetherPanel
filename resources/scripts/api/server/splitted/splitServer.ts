import http from '@/api/http';

export default async (
    uuid: string,
    cpu: number,
    ram: number,
    disk: number,
    swap: number,
    name: string,
    subuser: boolean
): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/splitted/split`, {
        cpu,
        ram,
        disk,
        swap,
        name,
        subuser,
    });
};
