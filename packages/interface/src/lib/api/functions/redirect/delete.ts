import api from '../../api';

export default async function deleteRedirect(id: string) {
    try {
        const res = await api.delete(`/redirect/${id}`);

        if (res.status === 200) return true;
    } catch (error) {
        return false;
    }

    return false;
}
