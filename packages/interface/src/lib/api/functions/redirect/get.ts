import type { redirectEntry } from '$lib/schemas/redirectEntries';
import api from '../../api';

export default async function getRedirect(id: string) {
    const res = await api.get(`/redirect/${id}`);

    const data: redirectEntry = res.data;

    return data;
}
