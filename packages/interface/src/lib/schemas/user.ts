import { z } from 'zod';

export const userSchema = z.object({
    id: z
        .string()
        .describe('The ID of the user, used internally')
        .default(() => crypto.randomUUID().split('-').join('')),
    name: z.string().describe('The display name of the user'),
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
