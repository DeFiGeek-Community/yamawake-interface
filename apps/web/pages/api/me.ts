import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession, type SessionOptions } from "iron-session";
import type { YamawakeSession } from "lib/types/iron-session";

const ironOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const session = await getIronSession<YamawakeSession>(req, res, ironOptions);
  switch (method) {
    case "GET":
      res.send({
        user: session.siwe
          ? {
              address: session.siwe.address,
              chainId: session.siwe.chainId,
              safeAccount: session.siwe.resources && session.siwe.resources[0],
            }
          : null,
      });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
