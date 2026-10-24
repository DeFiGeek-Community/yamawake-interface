import type { NextApiRequest } from "next";
import type { YamawakeSession } from "../types/iron-session";
import { getSupportedChain } from "../utils/chain";
import { ApiError } from "./api";

export function getSiweOrigin(req: NextApiRequest): string {
  const domain =
    process.env.SIWE_DOMAIN || (process.env.NODE_ENV !== "production" && req.headers.host);
  if (!domain) throw new ApiError(503, "Authentication is not configured.");
  const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = new URL(`${scheme}://${domain}`);
  if (
    origin.host !== domain ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new ApiError(503, "Authentication is not configured.");
  }
  return origin.origin;
}

export function requireSession(session: YamawakeSession, chainId?: number) {
  const { siwe, expiresAt } = session;
  const now = Date.now();
  if (
    !siwe ||
    !expiresAt ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= now ||
    (siwe.expirationTime &&
      (!Number.isFinite(Date.parse(siwe.expirationTime)) || Date.parse(siwe.expirationTime) <= now))
  )
    throw new ApiError(401, "Sign in required.");
  if (!getSupportedChain(siwe.chainId) || (chainId !== undefined && siwe.chainId !== chainId)) {
    throw new ApiError(403, "Session network does not match.");
  }
  return siwe;
}
