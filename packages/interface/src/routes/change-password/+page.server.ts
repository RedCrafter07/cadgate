import changePassword from '$lib/api/functions/user/changePassword.js';
import { validate } from '$lib/jwt/index.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ parent }) => {
    const data = await parent();

    const user = data.user!;
};

export const actions = {
    default: async ({ request, cookies }) => {
        const userID = (await validate(cookies.get('token')!)).sub;

        if (!userID) throw error(500);

        const formData = await request.formData();
        const currentPass = formData.get('currentPass');
        const newPass = formData.get('newPass');

        const input = z.object({
            currentPassword: z.string(),
            newPassword: z.string(),
        });

        const validation = input.safeParse({
            currentPassword: currentPass,
            newPassword: newPass,
        });

        if (!validation.success) {
            throw fail(400, {
                success: false,
                message: validation.error.message,
            });
        }

        const { data } = validation;

        await changePassword(userID, data.currentPassword, data.newPassword);

        throw redirect(307, '/');
    },
};
