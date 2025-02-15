import { proxyEntries, type proxyEntry } from '$lib/schemas/proxyEntries';
import api from '../../api';

export default async function updateProxy(input: proxyEntry) {
    const validation = proxyEntries.element.safeParse(input);

    if (!validation.success) return false;

    const { data } = validation;

    try {
        const res = await api.put(`/proxy/${input.id}`, data);

        if (res.status === 200) return true;
    } catch (error) {
        return false;
    }

    return false;
}
