import { db } from './db.ts';

export default async function getPasskeySettings() {
    const accessURL = (await db.getData('system')).mainURL;

    return generatePasskeyData(accessURL);
}

function generatePasskeyData(hostname: string) {
    const origin = hostname;
    const rpName = `Cadgate @ ${origin}`;
    const rpID = new URL(hostname).host;

    return { origin, rpName, rpID };
}
