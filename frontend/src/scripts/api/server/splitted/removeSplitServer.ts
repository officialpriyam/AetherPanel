import http from '@/api/http';

export default async (uuid: string, splitMasterUuid: string, serverUuid: string): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/splitted/splitremove`, {
        split_masteruuid: splitMasterUuid,
        serveruuid: serverUuid,
    });
};
