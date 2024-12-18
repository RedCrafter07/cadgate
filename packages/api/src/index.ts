import { Application, Router } from 'jsr:@oak/oak';
import chalk from 'npm:chalk';
import proxy from './routes/proxy.ts';
import redirect from './routes/redirect.ts';
import user from './routes/user.ts';
import webauthn from './routes/webAuthn.ts';
import system from './routes/system.ts';

const PORT = Number(Deno.env.get('PORT')) || 2000;

const app = new Application();

const router = new Router();

router.use('/proxy', proxy.routes(), proxy.allowedMethods());
router.use('/redirect', redirect.routes(), redirect.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/webauthn', webauthn.routes(), webauthn.allowedMethods());
router.use('/system', system.routes(), system.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port }) => {
    console.log(
        chalk.green(`Listening on http://${hostname ?? 'localhost'}:${port}`)
    );
});

app.listen({
    port: PORT,
});
