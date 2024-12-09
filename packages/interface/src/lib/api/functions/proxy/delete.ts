import api from '../../api';

export default async function deleteProxy(id: string) {
    try {
        const res = await api.delete(`/proxy/${id}`);

        if (res.status === 200) return true;
    } catch (error) {
        return false;
    }

    return false;
}
