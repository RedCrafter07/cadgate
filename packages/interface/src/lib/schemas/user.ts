import { z } from 'zod';

const userSchema = z.object({
    id: z.string().default('The ID of the user, used internally'),
    name: z.string().default('The display name of the user'),
    email: z
        .string()
        .email()
        .describe("The user's email. May be used for fetching certificates"),
    passwordHash: z.string(),
    administrator: z
        .boolean()
        .default(false)
        .describe('Gives full permission to everything'),
    requiresNewEmail: z.boolean().default(false),
    requiresNewPassword: z.boolean().default(false),
});

export type User = z.infer<typeof userSchema>;
