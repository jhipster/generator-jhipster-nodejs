# pnpm + Node 24 migration

Target generated output:

- Node 24.16.0
- pnpm 10.26.0
- pnpm workspace with server/client
- no npm workspace scripts
- Docker uses Node 24 + Corepack + pnpm
- generated app builds with pnpm
- generated app tests pass with pnpm

Golden generated app:

- my-nhipster-app setup branch

Do not start:

- flexible auth
- 2FA
- Firebase
