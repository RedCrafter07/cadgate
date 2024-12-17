import api from '$lib/api/api';

export default async function deleteCloudflare(userID: string) {
    try {
        await api.delete('/system/cloudflare', {
            headers: {
                uID: userID,
            },
        });
        return true;
    } catch {
        return false;
    }
}
