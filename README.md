# Cadgate

### A website for managing your Caddy Reverse Proxy / Redirect Entries

## Why?

I'm lazy and I like GUIs

## How to use

Use the installer:

```sh
curl -sSL https://cgi.r07.dev | bash
```

_Please note that the image is not yet built. Please be patient!_

## Planned features

-   [x] Enforce HTTPS
-   [x] CloudFlare integration
-   [x] Installer (for setting env variables, etc.)
-   [ ] Very basic certificate management
-   [ ] Load Balancing / Failover
-   [ ] Emergency scripts
-   [ ] Default routes
-   [ ] Offload CloudFlare to different process -> no long waiting times
-   [ ] Advanced Certificate management, incl. Cert renewal (via Certbot)
-   [ ] Config overrides
-   [ ] Audit logs
-   [ ] Route logs (user access)
-   [ ] Container lookup (-> automatically use Docker containers for hosts)
-   [ ] User management (incl. perms)
-   [ ] API Users
-   [ ] Access Lists (blacklist/whitelist countries/ips/etc.)
-   [ ] Backups
-   [ ] Importing existing Caddyfiles
-   [ ] _SQLite as DB (optional)_
-   [ ] _TCP Forwarding (optional)_

## Acknowledgements

-   [Tabler Icons](https://tabler.io/icons) for the favicon & icons used in this project
-   [SvelteKit](https://kit.svelte.dev) for the frontend framework
-   [Deno](https://deno.land) for the runtime

## License

This project has been licensed under the GPL-3.0 License. For more information, [please look here](LICENSE)
