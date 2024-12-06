import changeMail from '$lib/api/changeMail';
import { validate } from '$lib/jwt/index.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ parent }) => {
    const data = await parent();

    const user = data.user!;

    return { ...data, user };
};

export const actions = {
    default: async ({ request, cookies }) => {
        const userID = (await validate(cookies.get('token')!)).sub;

        if (!userID) throw error(500);

        const formData = await request.formData();
        const mail = formData.get('mail');

        const input = z.object({
            mail: z.string().email(),
        });

        const validation = input.safeParse({
            mail,
        });

        if (!validation.success) {
            throw fail(400, {
                success: false,
                message: validation.error.message,
            });
        }

        const { data } = validation;

        await changeMail(userID, data.mail);

        throw redirect(307, '/');
    },
};
