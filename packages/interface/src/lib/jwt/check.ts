import getUser from '$lib/api/functions/user/get';
import type { Cookies } from '@sveltejs/kit';
import moment from 'moment';
import { validate } from '.';

export async function checkJwt(cookies: Cookies) {
    const token = cookies.get('token');

    try {
        if (token) {
            const result = await validate(token);

            if (moment().unix() > result.exp!) throw new Error();

            const u = await getUser({ id: result.sub });

            const user = { ...u, passwordHash: undefined };

            return { user };
        }
        return false;
    } catch {
        return false;
    }
}
