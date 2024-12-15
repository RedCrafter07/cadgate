import {
    redirectEntries,
    type redirectEntry,
} from '$lib/schemas/redirectEntries';
import { AxiosError } from 'axios';
import api from '../../api';

export default async function updateRedirect(input: redirectEntry) {
    const validation = redirectEntries.element.safeParse(input);

    if (!validation.success) return false;

    const { data } = validation;

    try {
        const res = await api.put(`/redirect/${input.id}`, data);

        if (res.status === 200) return true;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(error.response);
        }
        return false;
    }

    return false;
}
