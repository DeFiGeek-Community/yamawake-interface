import type { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { getIronSession } from "iron-session";
import ironOptions from "lib/constants/ironOptions";
import type { YamawakeSessionData } from "lib/types/iron-session";
import { saveNonce } from "lib/dynamodb/authNonce";
import { getSiweOrigin } from "lib/auth/session";
import { sendApiError } from "lib/auth/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }
  try {
    getSiweOrigin(req);
    const session = await getIronSession<YamawakeSessionData>(req, res, ironOptions);
    const nonce = generateNonce();
    await saveNonce(nonce);
    session.nonce = nonce;
    await session.save();
    res.setHeader("Content-Type", "text/plain");
    return res.send(nonce);
  } catch (error) {
    return sendApiError(error, res);
  }
}
