import { Router } from 'jsr:@oak/oak';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedAuthenticationResponse,
} from 'jsr:@simplewebauthn/server';
import {
    deletePasskey,
    filterPasskey,
    findPasskey,
    findUser,
    pushPasskey,
    updatePasskey,
    updateUser,
} from '@/api/src/util/db.ts';
import { dbSchema } from '@/util/schemas/db.ts';
import { z } from 'npm:zod';
import { Buffer } from 'node:buffer';
import moment from 'npm:moment';
import { AuthenticationResponseJSON } from 'jsr:@simplewebauthn/types@12';

const origin = 'http://localhost:5173';
const rpName = `Cadgate @ ${origin}`;
const rpID = 'localhost';

type DbPasskey = z.infer<typeof dbSchema.shape.passkeys.element>;

const router = new Router();

const challenges: Record<string, { value: string; expires: number }> = {};

router.delete('/key/:id', async ({ params, response }) => {
    const { id } = params;

    await deletePasskey({ id });

    response.status = 200;
});

router.get('/key/:userID', async ({ params, response }) => {
    const { userID } = params;

    const passkeys = await filterPasskey({ userID });

    response.body = passkeys;
});

router.get('/register/:id', async ({ params, response }) => {
    const { id } = params;

    const user = await findUser({ id });

    if (!user) {
        response.status = 404;
        return;
    }

    const options = await generateRegistrationOptions({
        rpID,
        rpName,
        userID: Buffer.from(user.id),
        userName: user.name,
        attestationType: 'none',

        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
    });

    const success = await updateUser(
        { id: user.id },
        { challenge: options.challenge }
    );

    if (!success) {
        response.status = 500;
        return;
    }

    response.body = options;
});

router.post('/register', async ({ request, response }) => {
    const body = await request.body.json();
    const { userID, registrationResponse, name } = body;
    const user = await findUser({ id: userID });

    if (!user || !user.challenge) {
        response.status = 400;
        response.body = { error: 'Invalid user or challenge' };
        return;
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: registrationResponse,
            expectedChallenge: user.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: false,
        });

        if (verification.verified) {
            const { credential, credentialDeviceType, credentialBackedUp } =
                verification.registrationInfo!;

            const passkey: DbPasskey = {
                ...credential,
                name,
                userID,
                backedUp: credentialBackedUp,
                deviceType: credentialDeviceType,
            };

            await pushPasskey(passkey);

            await updateUser({ id: userID }, { challenge: null });

            response.body = { verified: true };
        } else {
            response.body = { verified: false };
        }
        // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        console.log(error);
        response.status = 500;
        response.body = { error: error.message };
    }
});

router.get('/login', async ({ response }) => {
    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: [],
        userVerification: 'preferred',
    });

    const sID = crypto.randomUUID();

    challenges[sID] = {
        expires: moment().add(5, 'minutes').unix(),
        value: options.challenge,
    };

    response.body = { sID, options };
});

router.post('/login', async ({ request, response }) => {
    const body = await request.body.json();

    const input: AuthenticationResponseJSON = body.passkey;
    const sID = body.sID;

    const passkey = await findPasskey({ id: input.rawId });

    if (!passkey) {
        response.status = 400;
        return;
    }

    const challenge = challenges[sID];

    delete challenges[sID];

    if (!challenge || moment.unix(challenge.expires).isBefore(moment())) {
        response.status = 401;
        return;
    }

    let verification: VerifiedAuthenticationResponse | undefined = undefined;
    try {
        verification = await verifyAuthenticationResponse({
            response: input,
            expectedChallenge: challenge.value,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: passkey.id,
                publicKey: passkey.publicKey,
                counter: passkey.counter,
                transports: passkey.transports,
            },
            requireUserVerification: false,
        });
        // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        console.error(error);
        response.status = 400;
        response.body = { error: error.message };
        return;
    }

    const { userID } = passkey;

    await updateUser({ id: userID }, { challenge: null });

    if (!verification) return;
    response.body = { verified: verification.verified, userID };

    if (!verification.verified) return;
    const { newCounter } = verification.authenticationInfo;
    await updatePasskey({ id: passkey.id }, { counter: newCounter });
});

export default router;
