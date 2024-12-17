import api from '$lib/api/api';

export default async function getIP(userID: string) {
    try {
        const res = await api.get('/system/ip', {
            headers: {
                uID: userID,
            },
        });

        return res.data as { ip: string | null };
    } catch {
        return false;
    }
}
