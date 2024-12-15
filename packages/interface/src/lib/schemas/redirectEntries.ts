import { z } from 'zod';

export const redirectEntries = z
    .object({
        id: z.string().default(() => crypto.randomUUID().split('-').join('')),
        name: z.string().optional(),
        cloudflare: z
            .boolean()
            .default(false)
            .describe(
                'Integrate this endpoint with your CloudFlare Credentials'
            ),
        hosts: z
            .string()
            .array()
            .default([])
            .describe('The hosts redirected to the "To" entry'),
        to: z.string().url(),
        preservePath: z.boolean().default(false),
    })
    .array();

export type redirectEntry = z.infer<typeof redirectEntries.element>;
