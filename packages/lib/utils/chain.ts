import * as chains from "viem/chains";
import { SUPPORTED_CHAINS } from "../constants/chains";

export const getChain = (chainId: number): chains.Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  return chains.localhost;
};

export const isSupportedChain = (chain: string | number): boolean => {
  if (typeof chain === "string") {
    return !!SUPPORTED_CHAINS.find((c) => c.name.toLowerCase() === chain);
  } else if (typeof chain === "number") {
    return !!SUPPORTED_CHAINS.find((c) => c.id === chain);
  }
  return false;
};

export const getSupportedChain = (chain: string | number): chains.Chain | undefined => {
  if (typeof chain === "string") {
    return SUPPORTED_CHAINS.find((c) => c.name.toLowerCase() === chain);
  } else if (typeof chain === "number") {
    return SUPPORTED_CHAINS.find((c) => c.id === chain);
  }
  return undefined;
};

export const getDefaultChain = (): chains.Chain => {
  if (typeof process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID !== "string") {
    throw new Error("NEXT_PUBLIC_DEFAULT_CHAIN_ID is not set");
  }

  const chain = getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID));

  if (typeof chain === "undefined") {
    throw new Error("Unsupported chain is set to NEXT_PUBLIC_DEFAULT_CHAIN_ID");
  }

  return chain;
};
