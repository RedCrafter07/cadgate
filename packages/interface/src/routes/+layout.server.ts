import { validate } from '$lib/jwt/index.js';
import type { User } from '$lib/schemas/user.js';
import { redirect } from '@sveltejs/kit';
import axios from 'axios';
import moment from 'moment';

export const load = async ({ cookies, route }) => {
    const token = cookies.get('token');

    try {
        if (token) {
            const result = await validate(token);

            if (moment().unix() > result.exp!) throw new Error();

            const userRequest = await axios
                .get('http://localhost:2000/user', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'GET',
                    params: {
                        id: result.sub,
                    },
                })
                .catch(() => {
                    throw new Error();
                });

            const requestData = userRequest.data as User;

            const user = { ...requestData, passwordHash: undefined };

            return { user };
        } else {
            cookies.delete('token', { path: '/' });
            if (route.id !== '/login') throw new Error();
        }
    } catch {
        throw redirect(307, '/login');
    }
};
