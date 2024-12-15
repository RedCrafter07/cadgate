import { z } from 'zod';

const proxyEntries = z
    .object({
        hosts: z
            .string()
            .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                message:
                    'Invalid url. Please consider excluding "http(s)://" in front.',
            })
            .array()
            .default([])
            .describe('The hosts proxied to the "To" entry'),
        to: z
            .string()
            .regex(/^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?$/, {
                message: 'Invalid hostname!',
            })
            .url()
            .describe('The location the hosts are proxied to'),
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
