import api from '$lib/api/api';

export default async function setMail(userID: string, mail: string) {
    try {
        await api.post('/system/tls/mail', {
            uID: userID,
            mail,
        });

        return true;
    } catch {
        return false;
    }
}
