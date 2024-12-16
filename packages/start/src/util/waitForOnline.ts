import axios from 'npm:axios';

export default function waitForOnline(
    address: string,
    interval = 5000,
    timeout = 60000
) {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        const checkStatus = async () => {
            try {
                await axios.get(address);
                resolve();
            } catch {
                if (Date.now() - startTime > timeout) {
                    reject(
                        new Error(
                            `Timed out waiting for ${address} to be online`
                        )
                    );
                } else {
                    setTimeout(checkStatus, interval);
                }
            }
        };

        checkStatus();
    });
}
