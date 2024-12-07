import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const data = await parent();

    const user = data.user!;

    if (user.requiresNewPassword) {
        throw redirect(307, '/change-password');
    } else if (user.requiresNewEmail) {
        throw redirect(307, '/change-mail');
    }

    return { ...data, user };
};
