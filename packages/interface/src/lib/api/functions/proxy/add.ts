import { proxyEntries, type proxyEntry } from '$lib/schemas/proxyEntries';
import api from '../../api';

export default async function addProxy(input: proxyEntry) {
    const validation = proxyEntries.element.safeParse(input);

    if (!validation.success) return false;

    const { data } = validation;

    try {
        const res = await api.post('/proxy', data);

        if (res.status === 200) return true;
    } catch (error) {
        return false;
    }
}
