import type { User } from '$lib/schemas/user';

export default function censorUser(user: User) {
    const censoredUser: User = {
        ...user,
        challenge: 'censored',
        passwordHash: 'censored',
    };

    return censoredUser;
}
