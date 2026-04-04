import http from '@/api/http';
import { TicketsResponse } from '@/components/tickets/TicketsContainer';

export default async (): Promise<TicketsResponse> => {
    const { data } = await http.get('/api/client/tickets');

    return (data.data || []);
};
