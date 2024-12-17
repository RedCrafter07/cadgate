import api from '$lib/api/api';

export default async function autoIP(userID: string) {
    try {
        const res = await api.post('/system/ip/auto', { uID: userID });

        return res.data as { ip: string };
    } catch {
        return false;
    }
}
