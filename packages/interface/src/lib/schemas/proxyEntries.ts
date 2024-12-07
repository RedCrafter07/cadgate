import { z } from 'zod';

const proxyEntries = z
    .object({
        hosts: z
            .string()
            .array()
            .min(1)
            .describe('The hosts proxied to the "To" entry'),
        to: z.string().describe('The location the hosts are proxied to'),
        enforceHttps: z
            .boolean()
            .default(false)
            .describe('Enforce HTTPS to this endpoint'),
        cloudflare: z
            .boolean()
            .default(false)
            .describe(
                'Integrate this endpoint with your CloudFlare Credentials'
            ),
        name: z.string().optional(),
        id: z.string().default(() => crypto.randomUUID().split('-').join('')),
    })
    .array();

export type proxyEntry = z.infer<typeof proxyEntries.element>;

export { proxyEntries };
