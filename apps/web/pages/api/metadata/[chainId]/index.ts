import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import type { IronSessionOptions, IronSession } from "iron-session";
import { getContract, PublicClient, GetContractReturnType, Transport } from "viem";
import { Chain } from "viem/chains";
import { getSupportedChain, isSupportedChain } from "lib/utils/chain";
import { getViemProvider } from "lib/utils/serverside";
import { DBClient } from "lib/dynamodb/metaData";
import BaseTemplateABI from "lib/constants/abis/BaseTemplate.json";
import { MetaData } from "lib/types/Auction";

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

const requireContractOwner = (
  body: any,
  session: IronSession,
  chainId: number,
): Promise<{
  metaData: MetaData;
  auctionContract: GetContractReturnType<typeof BaseTemplateABI, PublicClient>;
  provider: PublicClient<Transport, Chain | undefined>;
}> => {
  return new Promise(async (resolve, reject) => {
    if (!session.siwe) return reject("Unauthorized");
    const metaData = Object.assign(body, { chainId });
    const provider = getViemProvider(chainId) as PublicClient;
    const auctionContract = getContract({
      address: metaData.id,
      abi: BaseTemplateABI,
      publicClient: provider,
    });
    try {
      const contractOwner = await auctionContract.read.owner();
      if (
        contractOwner !== session.siwe.address &&
        session.siwe.resources &&
        contractOwner !== session.siwe.resources[0]
      )
        reject("You are not the owner of this contract");
      resolve({ metaData, auctionContract, provider });
    } catch (error: unknown) {
      if (error instanceof Error) {
        reject(error.name);
        console.error(`[ERROR] ${error.name} ${error.message}`);
      } else {
        reject("Unknown error");
        console.error(`[ERROR] Unknown error ${error}`);
      }
    }
  });
};

const requireAvailableNetwork = (req: NextApiRequest): number => {
  if (!req.session.siwe) throw new Error("Sign in required");
  if (!isSupportedChain(req.session.siwe.chainId)) throw new Error("Wrong network");
  return req.session.siwe.chainId;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      try {
        const { lastEvaluatedKeyId, lastEvaluatedKeyCreatedAt, chainId } = req.query;
        let requestedChain: Chain | undefined;
        if (typeof chainId === "string") {
          requestedChain = getSupportedChain(chainId);
        }
        if (!requestedChain) return res.status(404).end("No auction found");

        const metaData = await dbClient.scanMetaData(
          requestedChain.id,
          lastEvaluatedKeyId as string,
          lastEvaluatedKeyCreatedAt as string,
        );
        res.json({ metaData });
      } catch (_error: any) {
        console.log(_error);
        res.status(500).end(String(_error));
      }
      break;
    case "POST":
      try {
        const sessionChainId = requireAvailableNetwork(req);
        const { chainId } = req.query;

        // To prevent editing off-chain data related to a contract on a different chain than the user signed,
        // ensure that the requested chainId matches the chainId included in the session.
        // Even without this check, data on the requested chain will only be updated if the user is the owner of the contract for the requested chainId,
        // but this behavior would not be expected by the application, so it might be better to check just in case.
        if (Number(chainId) !== sessionChainId)
          throw new Error("Network does not match. Please logout and login again");

        const { metaData } = await requireContractOwner(req.body, req.session, Number(chainId));

        const result = await dbClient.addMetaData(metaData);
        res.json({ result });
      } catch (_error) {
        console.log(_error);
        res.status(500).end(String(_error));
      }
      break;
    case "PUT":
      try {
        const sessionChainId = requireAvailableNetwork(req);
        const { chainId } = req.query;
        if (Number(chainId) !== sessionChainId)
          throw new Error("Network does not match. Please logout and login again");

        const { metaData } = await requireContractOwner(req.body, req.session, Number(chainId));

        const result = await dbClient.updateAuction(metaData);
        res.json({ result });
      } catch (_error: any) {
        console.log(_error);
        res.status(500).end(String(_error));
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
