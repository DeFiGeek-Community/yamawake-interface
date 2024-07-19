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

Example CHAIN_INFO settings for local development with CCIP

```json
{
   31337: {
      ...sepolia,
      id: 31337,
      name: "Local8545",
      network: "local8545",
      rpcUrls: {
      default: {
         http: ["http://127.0.0.1:8545"],
      },
      public: {
         http: ["http://127.0.0.1:8545"],
      },
      },
      contracts: undefined,
      sourceId: null,
      chainSelector: 16015286601757825753n,
   },
   31338: {
      ...arbitrumSepolia,
      id: 31338,
      name: "Local8546",
      network: "local8546",
      rpcUrls: {
      default: {
         http: ["http://127.0.0.1:8546"],
      },
      public: {
         http: ["http://127.0.0.1:8546"],
      },
      },
      contracts: undefined,
      sourceId: sepolia.id,
      chainSelector: 3478487238524512106n,
   },
}
```

Example of .env.test for local chain.

```
NEXT_PUBLIC_DEFAULT_CHAIN_ID='31337'
NEXT_PUBLIC_SUPPOTED_CHAIN_IDS="31337"
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
