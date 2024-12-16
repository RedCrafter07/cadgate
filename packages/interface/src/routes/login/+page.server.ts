import { error, fail, redirect } from '@sveltejs/kit';
import axios, { AxiosError } from 'axios';
import * as jwt from '$lib/jwt';
import type { User } from '$lib/schemas/user.js';
import getLoginOptions from '$lib/api/functions/webauthn/login/options.js';

export const load = ({ cookies }) => {
    if (cookies.get('token')) {
        throw redirect(307, '/');
    }
};

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();

        const mail = data.get('email')?.toString();
        const password = data.get('password')?.toString();

        if (!mail || !password) {
            return fail(403, {
                message: 'Email or password missing',
                mail,
                success: false,
            });
        }

        const userRequest = await axios
            .get('http://localhost:2000/user', {
                params: {
                    email: mail,
                },
            })
            .catch((e: AxiosError) => {
                console.log(e);
                if (e.status !== 404) {
                    throw error(500);
                }
            });

        if (!userRequest) {
            return fail(401, {
                success: false,
                message: 'Invalid login credentials',
                mail,
            });
        }

        const user: User = userRequest.data;

        if (user.forcePasskey) {
            return fail(401, {
                success: false,
                message:
                    'Login with default credentials is not supported for this user.',
                mail,
            });
        }

        const validationRequest = await axios
            .post(
                'http://localhost:2000/user/validate',
                {
                    id: user.id,
                    password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            .catch((e) => {
                console.log(e.data);
                error(500);
            });

        const { valid } = validationRequest.data;

        if (!valid) {
            return fail(401, {
                success: false,
                message: 'Invalid login credentials.',
                mail,
            });
        }

        const token = await jwt.create(user.id);

        cookies.set('token', token, {
            path: '/',
        });

        throw redirect(307, '/');
    },
    passkey: async ({ cookies }) => {
        const data = await getLoginOptions();

        if (!data) return fail(500);

        cookies.set('loginSession', data.sID, { path: '/' });
        return { options: data.options };
    },
};
