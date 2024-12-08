import api from '$lib/api/api';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

export default async function validateLogin(
    authRepsonse: AuthenticationResponseJSON,
    sID: string
) {
    try {
        const res = await api.post(`/webauthn/login`, {
            passkey: authRepsonse,
            sID,
        });

        const { verified, userID } = res.data;

        return { verified: verified as boolean, userID: userID as string };
    } catch (e) {
        console.log(e);
        return false;
    }
}
