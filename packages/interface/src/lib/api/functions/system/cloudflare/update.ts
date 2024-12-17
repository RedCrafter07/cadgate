import api from '$lib/api/api';

export default async function updateCloudflare(
    userID: string,
    data: {
        apiKey: string;
        useProxy: boolean;
    }
) {
    try {
        await api.put('/system/cloudflare', {
            ...data,
            uID: userID,
        });
        return true;
    } catch {
        return false;
    }
}
