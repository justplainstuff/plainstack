# Deployment

Deploying plainweb means deploying a single long-running Node.js process.

## Providers

### Fly.io

plainweb ships with a `fly.toml` file that is ready to deploy to Fly.io.

1. `fly apps create -a <unique app name>`
2. edit `fly.toml` to set the `app` to <unique app name>
3. `fly deploy`

Fly takes regular backups of volumes, but it's still a good idea to have [Litestream](https://litestream.io/) for fine-grained backups.

### Docker

plainweb ships with a minimal `Dockerfile` so it can be deployed to any Docker-compatible host.

### Hetzner

WIP

### DigitalOcean

WIP

### Backups

Make sure to back up your SQLite database regularly. [Litestream](https://litestream.io/) is a great tool for this.

## Compression

plainweb doesn't compress responses by default. The event loop is single-threaded and CPU intensive tasks such as compression can block the event loop, causing slow responses. This negates the benefits of compression for most use cases.

Use a CDN or a reverse proxy to compress responses.
