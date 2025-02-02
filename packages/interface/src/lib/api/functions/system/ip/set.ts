import api from '$lib/api/api';

export default async function setIP(userID: string, ip: string) {
    try {
        await api.put('/system/ip', { uID: userID, ip });
        return true;
    } catch {
        return false;
    }
}
