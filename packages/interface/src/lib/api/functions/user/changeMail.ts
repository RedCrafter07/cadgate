import api from '../../api';

export default async function changeMail(id: string, to: string) {
    await api.put('/user/email', {
        id,
        to,
    });
}
