import { z } from 'npm:zod';

const dbSchema = z.object({
	proxyEntries: z
		.object({
			hosts: z
				.string()
				.array()
				.min(1)
				.describe('The hosts that are proxied to the "To" entry'),
			to: z.string().describe('The location the hosts are proxied to'),
			enforceHttps: z
				.boolean()
				.default(false)
				.describe('Enforce HTTPS to this endpoint'),
			cloudflare: z
				.boolean()
				.default(false)
				.describe('Integrate this endpoint with your CloudFlare Credentials'),
		})
		.array()
		.describe(
			'This will automatically override the current hosts. Hosts edited in the web dashboard will be disabled and may be selected to be deleted.',
		),

	users: z
		.object({
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
		})
		.array(),

	version: z.number().default(0.1),
});

export { dbSchema };
