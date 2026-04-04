import http from '@/api/http';
import { TicketResponse } from '@/components/tickets/TicketViewContainer';

export default async (id: number): Promise<TicketResponse> => {
    const { data } = await http.get(`/api/client/tickets/view/${id}`);

    return (data.data || []);
};
