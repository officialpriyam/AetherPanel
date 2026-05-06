import http from '@/api/http';

export default async (avatarUrl: string | null): Promise<string | null> => {
    const { data } = await http.put('/api/client/account/avatar', { avatar_url: avatarUrl });

    return data?.data?.avatar_url ?? null;
};
