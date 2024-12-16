import api from '$lib/api/api';

export default async function forcePasskey(userID: string, force: boolean) {
    try {
        await api.put('/user/forcePasskey', {
            userID,
            forcePasskey: force,
        });

        return true;
    } catch {
        return false;
    }
}
