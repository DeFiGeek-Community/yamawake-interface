import {
  mainnet,
  sepolia,
  holesky,
  arbitrum,
  hardhat,
  arbitrumSepolia,
  base,
  baseSepolia,
} from "viem/chains";

type SubgraphEndpoints = {
  readonly [key: number]: string | undefined;
};

export const SUBGRAPH_ENDPOINTS: SubgraphEndpoints = {
  [mainnet.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_MAINNET`],
  [sepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_SEPOLIA`],
  [arbitrum.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_ARBITRUM`],
  [arbitrumSepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_ARBITRUM_SEPOLIA`],
  [base.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_BASE`],
  [baseSepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_BASE_SEPOLIA`],
  [hardhat.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HARDHAT`],
  31338: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HARDHAT`],
};

export const SUBGRAPH_SECONDARY_ENDPOINTS: SubgraphEndpoints = {
  [mainnet.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_MAINNET`],
  [sepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_SEPOLIA`],
  [arbitrum.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_ARBITRUM`],
  [arbitrumSepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_ARBITRUM_SEPOLIA`],
  [base.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_BASE`],
  [baseSepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_BASE_SEPOLIA`],
  [hardhat.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_HARDHAT`],
};
