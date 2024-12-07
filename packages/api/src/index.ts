import { Application, Router } from 'jsr:@oak/oak';
import proxy from './util/routes/proxy.ts';
import user from './util/routes/user.ts';

const PORT = Number(Deno.env.get('PORT')) || 2000;

const app = new Application();

const router = new Router();

// TODO:
// - Audit Logging
// - User management & permissions
// - Redirect Settings
// - System Settings
// - Caddy Config Generation
// - 2FA/WebAuthn

// Done:
// - Proxy Settings

router.use('/proxy', proxy.routes(), proxy.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port, secure }) => {
    console.log(
        `Listening on: ${secure ? 'https://' : 'http://'}${
            hostname ?? 'localhost'
        }:${port}`
    );
});

app.listen({
    port: PORT,
});
