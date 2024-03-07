# bulk-auction-interface

### Build

```bash
pnpm build
```

### Develop

```bash
pnpm dev
```

#### with specific .env file

```bash
npx env-cmd -f .env.development.goerli pnpm dev
```

### E2E Test with Synpress

```bash
cd apps/web
npx env-cmd -f ../../.env.test pnpm test
```

With headless

```bash
cd apps/web
npx env-cmd -f ../../.env.test pnpm test:headless
```

With build

```bash
cd apps/web
npx env-cmd -f ../../.env.test pnpm test:build
```

Example of .env.test for local chain.

```
NEXT_PUBLIC_CHAIN_ID='31337'
NETWORK_NAME="hardhat"
TEST_PROVIDER_ENDPOINT="http://localhost:8545"
```

- Comment out BASIC_AUTH_USER and BASIC_AUTH_PASS in your .env while e2e test

### How to add templates

1. Add template name to packages/lib/constants/templates.ts

2. Create a directory under packages/ui/components/auctions and packages/ui/hooks

3. Add components and hooks as needed

4. Add switch conditions to the following files

- packages/ui/components/auctions/AuctionCard.tsx
- packages/ui/components/auctions/AuctionDetail.tsx
- packages/ui/components/auctions/AuctionFormWrapper.tsx

## Subgraph

### deploy

```bash
cd subgraph
yarn codegen && yarn build
yarn deploy --studio SUBGRAPH_NAME
```

### test

```bash
cd subgraph
yarn test
```

### CI

Simulate github workflow locally with nektos/act
https://github.com/nektos/act

```bash
act pull_request --secret-file .env.test.actions.secrets --env-file .env.test.actions --artifact-server-path /PATH/TO/ARTIFACTS/ --artifact-server-addr $(ipconfig getifaddr en0)
```
