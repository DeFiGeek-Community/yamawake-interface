import type { NextApiRequest, NextApiResponse } from "next";
import { DBClient } from "lib/dynamodb/metaData";
import { requireAddress, requireChain, sendApiError } from "lib/auth/api";

const dbClient = new DBClient({
  region: process.env._AWS_REGION as string,
  accessKey: process.env._AWS_ACCESS_KEY_ID as string,
  secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
  tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }
  try {
    const chain = requireChain(req.query.chainId);
    const address = requireAddress(req.query.id);
    return res.json({ metaData: await dbClient.fetchMetaData(address, chain.id) });
  } catch (error) {
    return sendApiError(error, res);
  }
}
