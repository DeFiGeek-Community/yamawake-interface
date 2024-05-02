import { mainnet, sepolia, holesky, arbitrum, hardhat } from "viem/chains";

type SubgraphEndpoints = {
  readonly [key: number]: string;
};

export const SUBGRAPH_ENDPOINTS: SubgraphEndpoints = {
  [mainnet.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_MAINNET`]!,
  [arbitrum.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_ARBITRUM`]!,
  [sepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_SEPOLIA`]!,
  [holesky.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HOLESKY`]!,
  [hardhat.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HARDHAT`]!,
};

export const SUBGRAPH_SECONDARY_ENDPOINTS: SubgraphEndpoints = {
  [mainnet.id]:
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_MAINNET`] ??
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_MAINNET`]!,
  [arbitrum.id]:
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_ARBITRUM`] ??
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_ARBITRUM`]!,
  [sepolia.id]:
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_SEPOLIA`] ??
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_SEPOLIA`]!,
  [holesky.id]:
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_HOLESKY`] ??
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HOLESKY`]!,
  [hardhat.id]:
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_2_HARDHAT`] ??
    process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HARDHAT`]!,
};
