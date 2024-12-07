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
        enforceHttps: z
            .boolean()
            .default(false)
            .describe('Enforce HTTPS to this endpoint'),
        hosts: z
            .string()
            .min(1)
            .array()
            .describe('The hosts redirected to the "To" entry'),
        to: z.string(),
        preservePath: z.boolean().default(false),
    })
    .array();
