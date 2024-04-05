import * as chains from "viem/chains";

// Get supported chain from NEXT_PUBLIC_SUPPOTED_CHAIN_IDS
export const getSupportedChains = (): chains.Chain[] => {
  const fallbackChains = [chains.sepolia];
  try {
    const chainIds: number[] = process.env
      .NEXT_PUBLIC_SUPPOTED_CHAIN_IDS!.split(",")
      .map((id) => Number(id));

    const matchedChains = chainIds
      .map((id) => {
        return Object.values(chains).find((chain) => chain.id === id) as chains.Chain;
      })
      .filter((chain: chains.Chain) => chain !== undefined);
    return matchedChains.length === 0 ? fallbackChains : matchedChains;
  } catch (e) {
    return fallbackChains;
  }
};

export const isSupportedChain = (chainId: string | number): boolean => {
  return !!getSupportedChain(chainId);
};

export const getSupportedChain = (chainId: string | number): chains.Chain | undefined => {
  return getSupportedChains().find((c) => c.id === Number(chainId));
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
