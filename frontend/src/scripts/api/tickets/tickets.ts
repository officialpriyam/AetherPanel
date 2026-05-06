import http from '@/api/http';
import { AxiosRequestConfig } from 'axios';
import { TicketsResponseData } from '@/api/tickets/types';

export const EMPTY_TICKETS_RESPONSE: TicketsResponseData = {
    tickets: [],
    categories: [],
    statuses: [],
    priorities: [],
    servers: [],
};

export default async (config?: AxiosRequestConfig): Promise<TicketsResponseData> => {
    const { data } = await http.get('/api/client/tickets', config);

    return data.data || EMPTY_TICKETS_RESPONSE;
};
