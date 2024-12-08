import api from '$lib/api/api';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

export default async function getRegistrationOptions(userID: string) {
    try {
        const res = await api.get(`/webauthn/register/${userID}`);

        const { data } = res;

        return data as PublicKeyCredentialCreationOptionsJSON;
    } catch {
        return false;
    }
}
