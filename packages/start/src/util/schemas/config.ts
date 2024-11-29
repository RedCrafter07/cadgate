import { z } from 'zod';

const configSchema = z.object({
	version: z.number().default(1),

	isSetUp: z.boolean().default(false),

	usesSqlite: z.boolean().default(false),

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
		.array(),
});

export default configSchema;
