import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import ironOptions from "lib/constants/ironOptions";
import type { YamawakeSessionData } from "lib/types/iron-session";
import { requireAddress, requireChain, sendApiError } from "lib/auth/api";
import { requireAuctionOwner } from "lib/auth/authorization";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }
  try {
    const chain = requireChain(req.query.chainId);
    const address = requireAddress(req.query.id);
    const session = await getIronSession<YamawakeSessionData>(req, res, ironOptions);
    const owner = await requireAuctionOwner(session, address, chain.id);
    return res.json({ owner });
  } catch (error) {
    return sendApiError(error, res);
  }
}
