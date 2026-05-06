import http from '@/api/http';

export interface SubdomainDomain {
    id: number;
    domain: string;
}

export interface ServerSubdomain {
    id: number;
    server_id: number;
    domain_id: number;
    subdomain: string;
    domain: string | null;
    port: number;
    record_type: 'CNAME' | 'SRV' | string;
}

export interface SubdomainResponse {
    domains: SubdomainDomain[];
    subdomains: ServerSubdomain[];
    ipAlias: string;
}

export default async (uuid: string): Promise<SubdomainResponse> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/subdomain`);

    return data.data;
};
