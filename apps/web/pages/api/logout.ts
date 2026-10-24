import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import ironOptions from "lib/constants/ironOptions";
import { sendApiError } from "lib/auth/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  try {
    const session = await getIronSession(req, res, ironOptions);
    session.destroy();
    return res.json({ ok: true });
  } catch (error) {
    return sendApiError(error, res);
  }
}
