import http from '@/api/http';

export interface Folder {
    id: number;
    name: string;
    description: string | null;
    userId: number;
}

export const getFolders = (): Promise<Folder[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/folders')
            .then(({ data }) => resolve((data.data || []).map((item: any) => ({
                id: item.attributes.id,
                name: item.attributes.name,
                description: item.attributes.description,
                userId: item.attributes.user_id,
            }))))
            .catch(reject);
    });
};

export const createFolder = (name: string): Promise<Folder> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/folders', { name })
            .then(({ data }) => resolve({
                id: data.attributes.id,
                name: data.attributes.name,
                description: data.attributes.description,
                userId: data.attributes.user_id,
            }))
            .catch(reject);
    });
};

export const deleteFolder = (id: number): Promise<void> => {
    return http.delete(`/api/client/folders/${id}`);
};

export const moveServerToFolder = (serverIdentifier: string, folderId: number | null): Promise<void> => {
    return http.post(`/api/client/folders/${serverIdentifier}/move`, { folder_id: folderId });
};
