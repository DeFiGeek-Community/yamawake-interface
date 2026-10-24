import { getContract, isAddress, type Address } from "viem";
import BaseTemplateABI from "../constants/abis/BaseTemplate.json";
import SafeABI from "../constants/abis/Safe.json";
import { getViemProvider } from "../utils/serverside";
import type { YamawakeSession } from "../types/iron-session";
import { ApiError } from "./api";
import { requireSession } from "./session";

export async function requireAuctionOwner(
  session: YamawakeSession,
  address: Address,
  chainId: number,
) {
  const siwe = requireSession(session, chainId);
  const publicClient = getViemProvider(chainId);
  const contract = getContract({ address, abi: BaseTemplateABI, publicClient });
  const owner = (await contract.read.owner()) as Address;
  const safeAddress = siwe.resources?.[0];
  if (safeAddress) {
    if (
      siwe.resources?.length !== 1 ||
      !isAddress(safeAddress) ||
      owner.toLowerCase() !== safeAddress.toLowerCase()
    ) {
      throw new ApiError(403, "You are not the owner of this contract.");
    }
    const safe = getContract({ address: safeAddress, abi: SafeABI, publicClient });
    if (!(await safe.read.isOwner([siwe.address]))) {
      throw new ApiError(403, "You are no longer an owner of this Safe.");
    }
  } else if (owner.toLowerCase() !== siwe.address.toLowerCase()) {
    throw new ApiError(403, "You are not the owner of this contract.");
  }
  return owner;
}
