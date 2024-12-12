import {
    redirectEntries,
    type redirectEntry,
} from '$lib/schemas/redirectEntries';
import api from '../../api';

export default async function addRedirect(input: redirectEntry) {
    const validation = redirectEntries.element.safeParse(input);

    if (!validation.success) return false;

    const { data } = validation;

    try {
        const res = await api.post('/redirect', data);

        if (res.status === 200) return true;
    } catch (error) {
        return false;
    }

    return false;
}
