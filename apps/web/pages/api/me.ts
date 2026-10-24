import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import ironOptions from "lib/constants/ironOptions";
import type { YamawakeSessionData } from "lib/types/iron-session";
import { requireSession } from "lib/auth/session";
import { ApiError, sendApiError } from "lib/auth/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }
  try {
    const session = await getIronSession<YamawakeSessionData>(req, res, ironOptions);
    if (!session.siwe) return res.json({ user: null });
    try {
      const siwe = requireSession(session);
      return res.json({
        user: { address: siwe.address, chainId: siwe.chainId, safeAccount: siwe.resources?.[0] },
      });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      session.destroy();
      return res.json({ user: null });
    }
  } catch (error) {
    return sendApiError(error, res);
  }
}
