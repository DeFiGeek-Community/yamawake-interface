import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession, type SessionOptions } from "iron-session";

const ironOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const session = await getIronSession(req, res, ironOptions);
  switch (method) {
    case "POST":
      session.destroy();
      res.send({ ok: true });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
