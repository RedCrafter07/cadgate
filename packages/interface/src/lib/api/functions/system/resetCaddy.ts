import api from '$lib/api/api';

export default async function resetCaddy(userID: string) {
    try {
        await api.post('/system/caddy/reset', { uID: userID });
        return true;
    } catch {
        return false;
    }
}
