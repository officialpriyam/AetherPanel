import http from '@/api/http';

export default (category: number, priority: number, message: string, subject: string, relatedServer: number): Promise<any> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/tickets/create', {
            category, priority, message, subject, relatedServer,
        }).then((data) => {
            resolve(data.data || []);
        }).catch(reject);
    });
};
