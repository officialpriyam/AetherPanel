import http from '@/api/http';

export default async (uuid: string, subdomain: string, domainId: number): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/subdomain/create`, {
        subdomain,
        domainId,
    });
};
