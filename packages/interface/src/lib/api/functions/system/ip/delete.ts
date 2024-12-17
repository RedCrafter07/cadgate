import api from '$lib/api/api';

export default async function deleteIP(userID: string) {
    try {
        await api.delete('/system/ip', {
            headers: {
                uID: userID,
            },
        });
        return true;
    } catch {
        return false;
    }
}
