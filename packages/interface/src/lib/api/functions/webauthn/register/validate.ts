import api from '$lib/api/api';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export default async function validateRegistration(
    userID: string,
    name: string,
    registrationResponse: RegistrationResponseJSON
) {
    try {
        const res = await api.post(`/webauthn/register`, {
            name,
            registrationResponse,
            userID,
        });

        const { verified } = res.data;

        return verified as boolean;
    } catch {
        return false;
    }
}
