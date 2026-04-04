import http from '@/api/http';
import { TicketResponseData } from '@/api/tickets/types';

export default async (id: number | string): Promise<TicketResponseData> => {
    const { data } = await http.get(`/api/client/tickets/view/${id}`);

    return data.data;
};
