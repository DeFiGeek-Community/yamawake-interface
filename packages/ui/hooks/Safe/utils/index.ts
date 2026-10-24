import { ChainMismatchError, getNetwork } from "@wagmi/core";

export function assertActiveChain({ chainId }: { chainId: number }) {
  // Check that active chain and target chain match
  const { chain: activeChain, chains } = getNetwork();
  const activeChainId = activeChain?.id;
  if (chainId !== activeChainId) {
    throw new ChainMismatchError({
      activeChain: chains.find((x) => x.id === activeChainId)?.name ?? `Chain ${activeChainId}`,
      targetChain: chains.find((x) => x.id === chainId)?.name ?? `Chain ${chainId}`,
    });
  }
}

export function resolveSafeChainId(config: {
  chainId?: number;
  request?: { chainId?: number; chain?: { id: number } | null };
}): number {
  const preparedChainId = config.request?.chainId ?? config.request?.chain?.id;
  const chainId = config.chainId ?? preparedChainId;
  if (!chainId || !Number.isSafeInteger(chainId) || chainId < 1) {
    throw new Error("Target chain is required for Safe transactions");
  }
  if (preparedChainId !== undefined && preparedChainId !== chainId) {
    throw new Error("Prepared transaction network does not match target chain");
  }
  return chainId;
}

export async function assertProviderChain(provider: unknown, chainId: number) {
  assertActiveChain({ chainId });
  if (!provider || typeof (provider as { request?: unknown }).request !== "function") {
    throw new Error("Wallet provider is unavailable");
  }
  const connectedChainId = await (
    provider as {
      request: (args: { method: string }) => Promise<unknown>;
    }
  ).request({ method: "eth_chainId" });
  if (Number(connectedChainId) !== chainId) {
    throw new Error("Wallet provider network does not match target chain");
  }
}
