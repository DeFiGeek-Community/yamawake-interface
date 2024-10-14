# bulk-auction-interface

### Set up configs

1. Create .env

```
cp .env.sample .env
```

2. Set configs

Set up configs under `packages/lib/constants` as you need

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
NEXT_PUBLIC_ENV="local"
NEXT_PUBLIC_DEFAULT_CHAIN_ID='31337'
NETWORK_NAME="hardhat"
TEST_PROVIDER_ENDPOINT="http://localhost:8545"
TEST_FACTORY_ADDRESS="0x..."
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

### How to add new network

1. Deploy subgraph to the target network
2. Set up network configs in `packages/lib/constants/contracts` as you need
   - `packages/lib/constants/chains.ts`
   - `packages/lib/constants/contracts.ts`
   - `packages/lib/constants/subgraphEndpoints.ts`
   - `packages/lib/constants/templates.ts`
   - `packages/lib/constants/priceFeeds.ts`
3. Update environment variables
   - Add chain id to NEXT_PUBLIC_SUPPOTED_CHAIN_IDS
   - Add NEXT_PUBLIC_SUBGRAPH_ENDPOINT\_{NETWORK NAME}

## Subgraph

### deploy

```bash
cd subgraph
yarn codegen && yarn build:mainnet
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
