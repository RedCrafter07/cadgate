import { z } from 'zod';

export const redirectEntries = z
    .object({
        tls: z
            .object({
                mode: z.enum(['auto']),
            })
            .or(
                z.object({
                    mode: z.enum(['file']),
                    key: z.string(),
                    cert: z.string(),
                })
            )
            .optional()
            .default({ mode: 'auto' }),
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
            .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                message:
                    'Invalid url. Please consider excluding "http(s)://" in front.',
            })
            .array()
            .default([])
            .describe('The hosts redirected to the "To" entry'),
        to: z.string().regex(/^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?$/, {
            message: 'Invalid hostname!',
        }),
        preservePath: z.boolean().default(false),
    })
    .array();

export type redirectEntry = z.infer<typeof redirectEntries.element>;
