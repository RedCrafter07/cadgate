type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}.${P}`
		: never
	: never;

type Paths<T, D extends number = 5> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]: K extends string | number
				? T[K] extends object
					? K | Join<K, Paths<T[K], Prev[D]>>
					: K
				: never;
	  }[keyof T]
	: never;

type Prev = [never, 0, 1, 2, 3, 4, 5];

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? Rest extends Paths<T[K]>
			? PathValue<T[K], Rest>
			: never
		: never
	: P extends keyof T
	? T[P]
	: never;

export type { Paths, PathValue };
