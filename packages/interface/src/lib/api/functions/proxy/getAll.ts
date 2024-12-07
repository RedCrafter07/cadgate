import type { proxyEntry } from '$lib/schemas/proxyEntries';
import api from '../../api';

export default async function getProxies() {
    const res = await api.get('/proxy');

    const data: proxyEntry[] = res.data;

    return data;
}
