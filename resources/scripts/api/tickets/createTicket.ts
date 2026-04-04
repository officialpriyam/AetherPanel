import http from '@/api/http';

interface CreateTicketPayload {
    category: number;
    priority: number;
    message: string;
    subject: string;
    relatedServer: number;
}

export default async (payload: CreateTicketPayload): Promise<void> => {
    await http.post('/api/client/tickets/create', payload);
};
