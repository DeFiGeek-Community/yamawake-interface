import { NextApiRequest, NextApiResponse } from "next";
import { Chain } from "viem/chains";
import { DBClient } from "lib/dynamodb/metaData";
import { getDefaultChain, getSupportedChain } from "lib/utils/chain";

const dbClient = new DBClient({
  region: process.env._AWS_REGION as string,
  accessKey: process.env._AWS_ACCESS_KEY_ID as string,
  secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
  tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case "GET":
      try {
        const { id, chainId } = req.query;
        // requireAvailableNetwork(chainId);
        let requestedChain: Chain;
        if (typeof chainId === "string") {
          requestedChain = getSupportedChain(chainId) ?? getDefaultChain();
        } else {
          return res.status(404).end("No auction found");
        }

        const metaData = await dbClient.fetchMetaData(id as string, requestedChain.id);
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
}
