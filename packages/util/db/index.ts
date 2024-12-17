import { Config, JsonDB } from 'npm:node-json-db';
import path from 'node:path';
import { z, ZodObject } from 'npm:zod';
import { Paths, PathValue } from './types/path.ts';

// deno-lint-ignore no-explicit-any
class Database<S extends ZodObject<any>> {
    private dbPath: string;
    private db: JsonDB;
    private schema: S;

    constructor(dbPath: string, schema: S) {
        this.dbPath = dbPath;
        this.schema = schema;

        this.db = new JsonDB(
            new Config(path.resolve(this.dbPath), true, false, '.')
        );
    }

    async reload() {
        await this.db.reload();
    }

    async validate() {
        const data = await this.db.getData('.');
        return this.schema.safeParse(data);
    }

    async push<P extends Paths<z.infer<S>>>(
        path: P,
        value: PathValue<z.infer<S>, P>
    ): Promise<void> {
        await this.db.push(`.${path}`, value, true);
    }

    // @ts-ignore: Invalid error
    async getData<P extends Paths<z.infer<S>>>(
        path: P
    ): Promise<PathValue<z.infer<S>, P>> {
        const rawData = await this.db.getData(`.${path}`);
        const schemaAtPath = this.getSchemaAtPath(path);
        const validatedData = schemaAtPath.parse(rawData);
        return validatedData as PathValue<z.infer<S>, P>;
    }

    async delete<P extends Paths<z.infer<S>>>(path: P) {
        await this.db.delete(`.${path}`);
    }

    private getSchemaAtPath<P extends Paths<z.infer<S>>>(
        path: P
    ): z.ZodTypeAny {
        const pathParts = path.split('.');
        // deno-lint-ignore no-explicit-any
        let currentSchema: any = this.schema;

        for (const part of pathParts) {
            if (currentSchema instanceof z.ZodObject) {
                currentSchema = currentSchema.shape[part];
            } else {
                throw new Error(`Invalid path: ${path}`);
            }
        }

        if (!currentSchema) {
            throw new Error(`No schema found at path: ${path}`);
        }

        return currentSchema;
    }
}

export { Database };
