export function timeout<T>(duration: number) {
    return new Promise((res) => {
        setTimeout(res, duration);
    });
}
