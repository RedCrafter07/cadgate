import validateRegistration from '$lib/api/functions/webauthn/register/validate.js';
import { validate } from '$lib/jwt';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ cookies, request }) => {
    try {
        const token = cookies.get('token')!;
        const jwt = await validate(token);

        const userID = jwt.sub!;

        const body = await request.json();
        const { name, response } = body;

        const success = await validateRegistration(userID, name, response);

        return json({ success });
    } catch {
        return error(500);
    }
};
