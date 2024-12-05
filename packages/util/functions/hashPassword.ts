import { encodeHex } from 'jsr:@std/encoding/hex';

export async function hashPassword(toHash: string) {
    // Taken from https://docs.deno.com/examples/hashing/
    const pwBuffer = new TextEncoder().encode(toHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', pwBuffer);
    const hashedPassword = encodeHex(hashBuffer);

    return hashedPassword;
}
