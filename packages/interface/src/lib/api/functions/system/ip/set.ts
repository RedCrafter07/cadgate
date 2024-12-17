import api from '$lib/api/api';

export default async function setIP(userID: string, ip: string) {
    try {
        await api.put('/ip', { uID: userID, ip });
        return true;
    } catch {
        return false;
    }
}
