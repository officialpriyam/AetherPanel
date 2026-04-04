import http from '@/api/http';

export default (id: number, message: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/tickets/${id}/message`, {
            message,
        }).then((data) => {
            resolve(data.data || []);
        }).catch(reject);
    });
};
