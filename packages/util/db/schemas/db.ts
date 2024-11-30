import { z } from 'npm:zod';

const dbSchema = z.object({
	proxyEntries: z
		.object({
			hosts: z
				.string()
				.array()
				.min(1)
				.describe('The hosts that are proxied to the "To" entry'),
			to: z.string().describe('The location the hosts are proxied to.'),
			enforceHttps: z.boolean().default(false),
			cloudflare: z.boolean().default(false),
		})
		.array()
		.describe(
			'This will automatically override the current hosts. Hosts edited in the web dashboard will be disabled and may be selected to be deleted.',
		),

	users: z
		.object({
			id: z.string(),
			name: z.string(),
			email: z.string().email(),
			passwordHash: z.string(),
		})
		.array(),

	version: z.number().default(0.1),
});

export { dbSchema };
