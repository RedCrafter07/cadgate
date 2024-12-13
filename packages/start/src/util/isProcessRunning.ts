export async function isProcessRunning(
    proc: Deno.ChildProcess
): Promise<boolean> {
    try {
        const statusPromise = proc.status;
        const timeoutPromise = new Promise((resolve) =>
            setTimeout(resolve, 100)
        );
        await Promise.race([statusPromise, timeoutPromise]);
        return !statusPromise; // If the promise resolves, the process is not running
    } catch {
        return false;
    }
}
