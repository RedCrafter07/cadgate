import { z } from 'npm:zod';
import { dbSchema } from './db.ts';

const configSchema = z
    .object({
        version: z
            .number()
            .default(0.1)
            .describe('Config version for migration'),

        isSetUp: z
            .boolean()
            .default(false)
            .describe('If this is false, the setup will run again.'),

        // usesSqlite: z
        // 	.boolean()
        // 	.optional()
        // 	.default(false)
        // 	.describe(
        // 		'Since sqlite is not implemented, this is false by default. A future implementation will come.',
        // 	),

        proxyEntries: dbSchema.shape.proxyEntries.optional(),
    })
    .default({ isSetUp: false, version: 0.1 });

export default configSchema;
