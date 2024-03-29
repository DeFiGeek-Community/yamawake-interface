import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { DBClient } from "lib/dynamodb/metaData";
import { IronSessionOptions } from "iron-session";

const ironOptions: IronSessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const dbClient = new DBClient({
  region: process.env._AWS_REGION as string,
  accessKey: process.env._AWS_ACCESS_KEY_ID as string,
  secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
  tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
});

const availableNetwork = [Number(process.env.NEXT_PUBLIC_CHAIN_ID)];

const requireAvailableNetwork = (chainId: number) => {
  if (!availableNetwork.includes(chainId)) throw new Error("Wrong network");
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      try {
        const { id } = req.query;
        // requireAvailableNetwork(chainId);
        const metaData = await dbClient.fetchMetaData(id as string);
        res.json({ metaData });
      } catch (_error: any) {
        console.log(_error.message);
        res.status(500).end(_error.message);
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
