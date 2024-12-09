export function encodeKey(input: Uint8Array): string {
    return btoa(String.fromCharCode(...input));
}

export function decodeKey(input: string): Uint8Array {
    return new Uint8Array(
        atob(input)
            .split('')
            .map((c) => c.charCodeAt(0))
    );
}
