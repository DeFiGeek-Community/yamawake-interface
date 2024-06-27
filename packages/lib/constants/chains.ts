import type { Chain } from "viem/chains";
import { mainnet, sepolia, arbitrum, arbitrumSepolia, base, baseSepolia } from "viem/chains";

export type ChainInfo = Readonly<Chain> & { readonly belongsTo: number | null };

export const CHAIN_INFO: { [id: number]: ChainInfo } =
  process.env.NEXT_PUBLIC_ENV === "mainnet"
    ? {
        [mainnet.id]: { ...mainnet, belongsTo: null },
        [arbitrum.id]: { ...arbitrum, belongsTo: mainnet.id },
        [base.id]: { ...base, belongsTo: mainnet.id },
      }
    : {
        [sepolia.id]: { ...sepolia, belongsTo: null },
        [arbitrumSepolia.id]: { ...arbitrumSepolia, belongsTo: sepolia.id },
        [baseSepolia.id]: { ...baseSepolia, belongsTo: sepolia.id },
      };
