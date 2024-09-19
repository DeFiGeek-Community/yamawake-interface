import type { Chain } from "viem/chains";
import { mainnet, sepolia, arbitrum, arbitrumSepolia, base, baseSepolia } from "viem/chains";

export type ChainInfo = Readonly<Chain> & {
  readonly chainSelector: bigint;
};

export const CHAIN_INFO: { [id: number]: ChainInfo } =
  process.env.NEXT_PUBLIC_ENV === "mainnet"
    ? {
        [mainnet.id]: { ...mainnet, chainSelector: 5009297550715157269n },
        // [arbitrum.id]: { ...arbitrum, chainSelector: 4949039107694359620n },
        // [base.id]: { ...base, chainSelector: 15971525489660198786n },
      }
    : process.env.NEXT_PUBLIC_ENV === "testnet"
      ? {
          [sepolia.id]: { ...sepolia, chainSelector: 16015286601757825753n },
          // [arbitrumSepolia.id]: {
          //   ...arbitrumSepolia,
          //   chainSelector: 3478487238524512106n,
          // },
          [baseSepolia.id]: {
            ...baseSepolia,
            chainSelector: 10344971235874465080n,
          },
        }
      : {
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
            chainSelector: 3478487238524512106n,
          },
        };
