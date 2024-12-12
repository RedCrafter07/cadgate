import {
    redirectEntries,
    type redirectEntry,
} from '$lib/schemas/redirectEntries';
import api from '../../api';

export default async function updateRedirect(input: redirectEntry) {
    const validation = redirectEntries.element.safeParse(input);

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
