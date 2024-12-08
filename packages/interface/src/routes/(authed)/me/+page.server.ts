import deletePasskey from '$lib/api/functions/webauthn/delete';
import getPasskeys from '$lib/api/functions/webauthn/get.js';
import getRegistrationOptions from '$lib/api/functions/webauthn/register/options.js';
import { checkJwt } from '$lib/jwt/check.js';
import { validate } from '$lib/jwt/index.js';
import { fail } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const data = await parent();

    const passkeys = await getPasskeys(data.user.id);

    return { passkeys };
};

export const actions = {
    register: async ({ cookies, request }) => {
        const token = cookies.get('token')!;
        const result = await validate(token);

        const userID = result.sub;
        if (!userID) return fail(500);

        const options = await getRegistrationOptions(userID);
        if (!options) return fail(500);

        const name = (await request.formData()).get('name');

        if (!name) return fail(400, { message: 'Name is required.' });

        return { options, name };
    },
    delkey: async ({ cookies, request }) => {
        const jwt = await checkJwt(cookies);
        if (!jwt) return fail(401);

        const passkeyID = (await request.formData()).get('id');
        if (!passkeyID) return fail(400);

        const passkeys = await getPasskeys(jwt.user.id);

        if (!passkeys.filter((k) => k.id === passkeyID)) return fail(401);

        await deletePasskey(passkeyID.toString());

        return { success: true };
    },
};
