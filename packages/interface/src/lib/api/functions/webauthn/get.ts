import api from '$lib/api/api';
import type { DbPasskeys } from '$lib/schemas/passkeys';

export default async function getPasskeys(userID: string) {
    const res = await api.get(`/webauthn/key/${userID}`);

    const data: DbPasskeys = res.data;

    const censored = data.map((k) => ({
        ...k,
        counter: undefined,
        publicKey: undefined,
    }));

    return censored;
}
