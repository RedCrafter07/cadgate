import api from '../../api';

export default async function changePassword(
    id: string,
    current: string,
    to: string
) {
    await api.put('/user/password', {
        id,
        current,
        to,
    });
}
