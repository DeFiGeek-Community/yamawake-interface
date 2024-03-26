import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { Chain, hardhat } from "viem/chains";
import { DBClient } from "lib/dynamodb/metaData";
import { IronSessionOptions } from "iron-session";
import { getSupportedChain } from "lib/utils/chain";
import { DYNAMODB_TABLES } from "lib/constants/dynamoDBTables";

const ironOptions: IronSessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      try {
        const { id, chainId } = req.query;
        // requireAvailableNetwork(chainId);
        const defaultChain =
          getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)) ?? hardhat;
        let requestedChain: Chain;
        if (typeof chainId === "string") {
          requestedChain = getSupportedChain(chainId) ?? defaultChain;
        } else {
          return res.status(404).end("No auction found");
        }
        const dbClient = new DBClient({
          region: process.env._AWS_REGION as string,
          accessKey: process.env._AWS_ACCESS_KEY_ID as string,
          secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
          tableName: DYNAMODB_TABLES[requestedChain.id],
        });

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
