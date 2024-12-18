import api from '$lib/api/api';

export default async function deleteMail(userID: string) {
    try {
        await api.delete('/system/tls/mail', {
            headers: {
                uID: userID,
            },
        });

        return true;
    } catch {
        return false;
    }
}
