import { hashPassword } from '@/util/functions/hashPassword.ts';

export async function comparePasswords(hash: string, input: string) {
    const hashedPassword = await hashPassword(input);

    return hashedPassword === hash;
}
