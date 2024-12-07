import { z, ZodObject } from 'npm:zod';

export function updateFactory<
    D extends z.infer<S>,
    // deno-lint-ignore no-explicit-any
    S extends ZodObject<any>
>(get: () => Promise<D[]>, write: (data: D[]) => Promise<void>, schema: S) {
    type keys = keyof D;

    return async function (filter: Partial<D>, input: Partial<D>) {
        const validation = schema.partial().safeParse(input);

        if (!validation.success) return false;

        const keys = Object.keys(filter);
        const valid = keys.every((k) => schema.keyof().safeParse(k).success);

        if (!valid) return false;

        const typedKeys = keys as keys[];

        const dbData = await get();

        const searchIndex = dbData.findIndex((e) =>
            typedKeys.every((k) => e[k] === filter[k])
        );

        if (searchIndex < 0) return false;

        const el = dbData[searchIndex];

        dbData[searchIndex] = { ...el, ...input };

        await write(dbData);

        return true;
    };
}
