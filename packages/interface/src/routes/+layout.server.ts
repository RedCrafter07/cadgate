import censorUser from '$lib/api/censorUser.js';
import getUser from '$lib/api/functions/user/get.js';
import { validate } from '$lib/jwt/index.js';
import { redirect } from '@sveltejs/kit';
import moment from 'moment';

export const load = async ({ cookies, route }) => {
    const token = cookies.get('token');

    try {
        if (token) {
            const result = await validate(token);

            if (moment().unix() > result.exp!) throw new Error();

            const u = await getUser({ id: result.sub });

            const censoredUser = censorUser(u);

            return { user: censoredUser };
        } else {
            cookies.delete('token', { path: '/' });
            if (route.id !== '/login') throw new Error();
        }
    } catch {
        throw redirect(307, '/login');
    }
};
