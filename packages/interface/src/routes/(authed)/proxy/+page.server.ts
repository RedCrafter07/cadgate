import type { proxyEntries } from '$lib/schemas/proxyEntries';
import axios from 'axios';
import type { z } from 'zod';

export const load = async () => {
    const res = await axios.get('http://localhost:2000/proxy');

    const proxies: z.infer<typeof proxyEntries> = res.data;

    return { proxies };
};
