import type { redirectEntry } from '$lib/schemas/redirectEntries';
import api from '../../api';

export default async function getRedirects() {
    const res = await api.get('/redirect');

    const data: redirectEntry[] = res.data;

    return data;
}
