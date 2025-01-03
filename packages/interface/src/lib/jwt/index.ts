import moment from 'moment';
import * as jose from 'jose';
import { env } from '$env/dynamic/private';

const alg = 'HS256';

async function create(id: string) {
    const jwt = await new jose.SignJWT()
        .setSubject(id)
        .setIssuer('cadgate')
        .setExpirationTime(moment().add(6, 'h').toDate())
        .setIssuedAt(moment().toDate())
        .setProtectedHeader({ alg })
        .sign(new TextEncoder().encode(env.JWT_SECRET));

    return jwt;
}

async function validate(jwt: string) {
    const verification = await jose.jwtVerify(
        jwt,
        new TextEncoder().encode(env.JWT_SECRET)
    );

    return verification.payload;
}

export { create, validate };
