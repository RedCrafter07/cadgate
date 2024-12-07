import type { proxyEntry } from '$lib/schemas/proxyEntries';
import api from '../../api';

export default async function getProxy(id: string) {
    const res = await api.get(`/proxy/${id}`);

    const data: proxyEntry = res.data;

    return data;
}
