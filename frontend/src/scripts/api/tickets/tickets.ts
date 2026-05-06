import http from '@/api/http';
import { TicketsResponseData } from '@/api/tickets/types';

export default async (): Promise<TicketsResponseData> => {
    const { data } = await http.get('/api/client/tickets');

    return data.data || {
        tickets: [],
        categories: [],
        statuses: [],
        priorities: [],
        servers: [],
    };
};
