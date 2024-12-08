import api from '$lib/api/api';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

export default async function getLoginOptions() {
    try {
        const res = await api.get(`/webauthn/login`);

        const { data } = res;

        return {
            options: data.options as PublicKeyCredentialRequestOptionsJSON,
            sID: data.sID as string,
        };
    } catch {
        return false;
    }
}
