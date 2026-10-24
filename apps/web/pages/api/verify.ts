import type { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ethers, Network } from "ethers";
import { getIronSession } from "iron-session";
import { getContract, isAddress } from "viem";
import SafeABI from "lib/constants/abis/Safe.json";
import ironOptions, { SESSION_TTL_SECONDS } from "lib/constants/ironOptions";
import { getSupportedChain } from "lib/utils/chain";
import { getServerRPCEndpoints, getViemProvider } from "lib/utils/serverside";
import type { YamawakeSessionData } from "lib/types/iron-session";
import { consumeNonce, NONCE_TTL_SECONDS } from "lib/dynamodb/authNonce";
import { getSiweOrigin } from "lib/auth/session";
import { ApiError, sendApiError } from "lib/auth/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  let provider: ethers.JsonRpcProvider | undefined;
  try {
    const origin = getSiweOrigin(req);
    const session = await getIronSession<YamawakeSessionData>(req, res, ironOptions);
    if (!session.nonce) throw new ApiError(422, "Invalid nonce.");
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      throw new ApiError(400, "Invalid request.");
    }
    const { message, signature, chainId } = req.body;
    if (typeof signature !== "string" || !Number.isSafeInteger(chainId)) {
      throw new ApiError(400, "Invalid request.");
    }
    const siweMessage = new SiweMessage(message);
    const chain = getSupportedChain(chainId);
    if (!chain || siweMessage.chainId !== chain.id) throw new ApiError(422, "Invalid chain.");
    const issuedAt = Date.parse(siweMessage.issuedAt || "");
    if (
      !Number.isFinite(issuedAt) ||
      issuedAt > Date.now() + 60000 ||
      issuedAt < Date.now() - NONCE_TTL_SECONDS * 1000
    ) {
      throw new ApiError(422, "Invalid message time.");
    }
    if (new URL(siweMessage.uri).href !== new URL(origin).href) {
      throw new ApiError(422, "Invalid URI.");
    }
    if (
      siweMessage.resources?.length &&
      (siweMessage.resources.length !== 1 || !isAddress(siweMessage.resources[0]))
    ) {
      throw new ApiError(422, "Invalid Safe address.");
    }
    const endpoints = getServerRPCEndpoints(chain.id);
    if (!endpoints.length) throw new Error("RPC endpoint not configured");
    provider = new ethers.JsonRpcProvider(endpoints[0], Network.from(chain.id), {
      staticNetwork: true,
    });
    const fields = await siweMessage.verify(
      { signature, domain: new URL(origin).host, nonce: session.nonce },
      { provider },
    );
    if (fields.data.resources?.length) {
      const safe = getContract({
        address: fields.data.resources[0] as `0x${string}`,
        abi: SafeABI,
        publicClient: getViemProvider(chain.id),
      });
      if (!(await safe.read.isOwner([fields.data.address]))) {
        throw new ApiError(403, "You are not an owner of this Safe.");
      }
    } else {
      delete fields.data.resources;
    }
    // This conditional write is the single-use boundary, including parallel requests.
    if (!(await consumeNonce(session.nonce))) throw new ApiError(422, "Invalid nonce.");
    session.siwe = fields.data;
    session.expiresAt = Math.min(
      Date.now() + SESSION_TTL_SECONDS * 1000,
      fields.data.expirationTime ? Date.parse(fields.data.expirationTime) : Infinity,
    );
    session.nonce = undefined;
    await session.save();
    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) return sendApiError(error, res);
    // SIWE errors may contain the signed message. Keep the public response generic.
    return res.status(422).json({ error: "Verification failed." });
  } finally {
    provider?.destroy();
  }
}
