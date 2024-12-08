import validateLogin from '$lib/api/functions/webauthn/login/validate.js';
import { create } from '$lib/jwt/index.js';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ cookies, request }) => {
    const sID = cookies.get('loginSession');
    if (!sID) return error(401);

    const data = await request.json();

    const result = await validateLogin(data, sID);
    if (!result) {
        return error(401);
    }

    const { userID, verified } = result;

    const token = await create(userID);
    cookies.set('token', token, { path: '/' });
    cookies.delete('loginSession', { path: '/' });

    return json({ success: verified });
};
