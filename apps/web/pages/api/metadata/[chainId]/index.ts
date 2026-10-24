import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import ironOptions from "lib/constants/ironOptions";
import type { YamawakeSessionData } from "lib/types/iron-session";
import { DBClient } from "lib/dynamodb/metaData";
import { parseMetaData, requireChain, requireAddress, sendApiError } from "lib/auth/api";
import { requireAuctionOwner } from "lib/auth/authorization";
import { requireSession } from "lib/auth/session";

const dbClient = new DBClient({
  region: process.env._AWS_REGION as string,
  accessKey: process.env._AWS_ACCESS_KEY_ID as string,
  secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
  tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
});

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST", "PUT"].includes(req.method || "")) {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end();
  }
  try {
    const chain = requireChain(req.query.chainId);
    if (req.method === "GET") {
      const { lastEvaluatedKeyId, lastEvaluatedKeyCreatedAt } = req.query;
      if (lastEvaluatedKeyId !== undefined) requireAddress(lastEvaluatedKeyId);
      const metaData = await dbClient.scanMetaData(
        chain.id,
        lastEvaluatedKeyId as string | undefined,
        typeof lastEvaluatedKeyCreatedAt === "string" ? lastEvaluatedKeyCreatedAt : undefined,
      );
      return res.json({ metaData });
    }
    const session = await getIronSession<YamawakeSessionData>(req, res, ironOptions);
    requireSession(session, chain.id);
    const metaData = parseMetaData(req.body, chain.id);
    await requireAuctionOwner(session, metaData.id as `0x${string}`, chain.id);
    const result =
      req.method === "POST"
        ? await dbClient.addMetaData(metaData)
        : await dbClient.updateAuction(metaData);
    return res.json({ result });
  } catch (error) {
    return sendApiError(error, res);
  }
}
