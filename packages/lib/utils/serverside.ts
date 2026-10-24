import { type PublicClient, createPublicClient, fallback, http } from "viem";
import { getSupportedChain } from "./chain";

export const getServerRPCEndpoints = (chainId: number): string[] => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");

  const publicEndpoints = [...chain.rpcUrls.public.http];
  const thirdpartyEndpoints = [];
  if (chain.rpcUrls.infura && process.env.INFURA_API_TOKEN) {
    thirdpartyEndpoints.push(`${chain.rpcUrls.infura.http[0]}/${process.env.INFURA_API_TOKEN}`);
  }
  if (chain.rpcUrls.alchemy && process.env.ALCHEMY_API_KEY) {
    thirdpartyEndpoints.push(`${chain.rpcUrls.alchemy.http[0]}/${process.env.ALCHEMY_API_KEY}`);
  }
  return [...thirdpartyEndpoints, ...publicEndpoints];
};

export const getViemProvider = (chainId: number): PublicClient => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");
  const fallbackEndpoints = fallback(getServerRPCEndpoints(chainId).map((url) => http(url)));

  const client = createPublicClient({
    chain,
    transport: fallbackEndpoints,
  });
  return client;
};
