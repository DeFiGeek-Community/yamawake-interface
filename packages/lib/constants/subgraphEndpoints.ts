import { mainnet, sepolia, arbitrum, hardhat } from "viem/chains";

type SubgraphEndpoints = {
  readonly [key: number]: string;
};

export const SUBGRAPH_ENDPOINTS: SubgraphEndpoints = {
  [mainnet.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_MAINNET`]!,
  [arbitrum.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_ARBITRUM`]!,
  [sepolia.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_SEPOLIA`]!,
  [hardhat.id]: process.env[`NEXT_PUBLIC_SUBGRAPH_ENDPOINT_HARDHAT`]!,
};
