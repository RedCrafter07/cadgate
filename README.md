# Cadgate

### A website for managing your Caddy Reverse Proxy / Redirect Entries

## Why?

I'm lazy and I like GUIs

## How to use

Use the installer:

```sh
curl -sSL https://cgi.r07.dev | bash
```

_Please note that Cadgate is not meant to be used in a production environment yet._

## Planned features

-   [x] Enforce HTTPS
-   [x] CloudFlare integration
-   [x] Installer (for setting env variables, etc.)
-   [x] Very basic certificate management (auto only)
-   [ ] Developer documentation
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
-   [ ] _Plugin system (optional)_

## Project structure

The project's components are organized in the `packages/` directory:

### [`api/`](packages/api/)

The core backend service that:

-   Manages the database
-   Handles communication with Caddy
-   Processes frontend requests

### [`installer/`](packages/installer/)

Installation utility that:

-   simply generates a docker compose for deployment. It prints to console by default.

### [`interface/`](packages/interface/)

The frontend application that:

-   Provides the user interface
-   Manages user interactions

### [`start/`](packages/start/)

Startup component that:

-   Manages initialization
-   Handles system boot sequence

### [`util/`](packages/util/)

Shared utility library containing:

-   Common functions
-   Reusable components for API and startup

## Acknowledgements

-   [Tabler Icons](https://tabler.io/icons) for the favicon & icons used in this project
-   [SvelteKit](https://kit.svelte.dev) for the frontend framework
-   [Deno](https://deno.land) for the runtime
-   [Caddy](https://caddyserver.com/), the server in-use.

## License

This project has been licensed under the GPL-3.0 License. For more information, [please look here](LICENSE)
