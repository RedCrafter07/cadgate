import api from '$lib/api/api';

export default async function getIP(userID: string) {
    try {
        await api.get('/system/ip', {
            headers: {
                uID: userID,
            },
        });
        return true;
    } catch {
        return false;
    }
}
