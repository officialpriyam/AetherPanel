import http from '@/api/http';

export default async (id: number | string, message: string): Promise<void> => {
    await http.post(`/api/client/tickets/${id}/message`, { message });
};
