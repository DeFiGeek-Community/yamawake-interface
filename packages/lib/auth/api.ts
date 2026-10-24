import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";
import { getSupportedChain } from "../utils/chain";
import { validateMetaData, type MetaData } from "../types/Auction";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function sendApiError(error: unknown, res: NextApiResponse) {
  if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
  console.error("API request failed:", error);
  return res.status(500).json({ error: "Internal Server Error" });
}

export function requireChain(value: NextApiRequest["query"][string]) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new ApiError(400, "Invalid chain.");
  }
  const chain = getSupportedChain(value);
  if (!chain) throw new ApiError(400, "Unsupported chain.");
  return chain;
}

export function requireAddress(value: unknown): `0x${string}` {
  if (typeof value !== "string" || !isAddress(value)) {
    throw new ApiError(400, "Invalid contract address.");
  }
  return value;
}

export function parseMetaData(body: unknown, chainId: number): MetaData {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Invalid metadata.");
  }
  const input = body as Record<string, unknown>;
  const metaData: MetaData = { id: requireAddress(input.id), chainId };
  for (const key of [
    "title",
    "description",
    "terms",
    "projectURL",
    "logoURL",
    "otherURL",
  ] as const) {
    if (input[key] === undefined) continue;
    if (typeof input[key] !== "string") throw new ApiError(400, "Invalid metadata.");
    metaData[key] = input[key];
  }
  for (const key of ["targetTotalRaised", "maximumTotalRaised"] as const) {
    const value = input[key];
    if (value === undefined) continue;
    if (
      (typeof value !== "number" && typeof value !== "string") ||
      (typeof value === "string" && !/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0
    )
      throw new ApiError(400, "Invalid metadata amount.");
    metaData[key] = Number(value);
  }
  const errors = validateMetaData(metaData);
  if (Object.keys(errors).length) throw new ApiError(400, Object.values(errors).join(", "));
  return metaData;
}
