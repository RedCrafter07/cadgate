import api from '$lib/api/api';

export default async function getMail(userID: string) {
    try {
        await api.get('/system/tls/mail', {
            headers: {
                uID: userID,
            },
        });

        return true;
    } catch {
        return false;
    }
}
