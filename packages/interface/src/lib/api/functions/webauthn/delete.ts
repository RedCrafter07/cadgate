import api from '$lib/api/api';

export default async function deletePasskey(id: string) {
    try {
        await api.delete(`/webauthn/key/${id}`);
        return true;
    } catch {
        return false;
    }
}
