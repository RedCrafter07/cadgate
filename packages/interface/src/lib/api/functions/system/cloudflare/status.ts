import api from '$lib/api/api';

export default async function cloudflareStatus(
    userID: string,
    enable: boolean
) {
    try {
        await api.post('/system/cloudflare', { uID: userID, enabled: enable });
        return true;
    } catch {
        return false;
    }
}
