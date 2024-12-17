import api from '$lib/api/api';

export default async function getCloudflare(userID: string) {
    try {
        const res = await api.get('/system/cloudflare', {
            headers: {
                uID: userID,
            },
        });

        return res.data as {
            cfEnabled: boolean;
            cfKey: string | undefined;
            cfUseProxy: boolean | undefined;
            ip: string | undefined;
        };
    } catch {
        return false;
    }
}
