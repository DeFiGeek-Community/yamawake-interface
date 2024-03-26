import { NextApiRequest, NextApiResponse } from "next";
import { IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute } from "iron-session/next";
import { erc20ABI } from "wagmi";
import {
  createPublicClient,
  http,
  fallback,
  getContract,
  PublicClient,
  GetContractReturnType,
  Transport,
} from "viem";
import { Chain, hardhat } from "viem/chains";
import { getSupportedChain, isSupportedChain } from "lib/utils/chain";
import { DBClient } from "lib/dynamodb/metaData";
import BaseTemplateABI from "lib/constants/abis/BaseTemplate.json";
import { DYNAMODB_TABLES } from "lib/constants/dynamoDBTables";

const ironOptions: IronSessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const getViemProvider = (chainId: number) => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");

  // const alchemy = http(`https://eth-${chainName}.g.alchemy.com/v2/${}`)
  const rpc = chain.rpcUrls.infura
    ? http(`${chain.rpcUrls.infura.http}/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`)
    : http(`${chain.rpcUrls.public.http}`);
  const client = createPublicClient({
    chain,
    transport: fallback([rpc]),
  });
  return client;
};

const requireContractOwner = (
  req: NextApiRequest,
): Promise<{
  metaData: any;
  auctionContract: GetContractReturnType<typeof BaseTemplateABI, PublicClient>;
  provider: PublicClient<Transport, Chain | undefined>;
}> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!req.session.siwe) return reject("Unauthorized");
      const metaData = req.body;
      const provider = getViemProvider(req.session.siwe.chainId) as PublicClient;
      const auctionContract = getContract({
        address: metaData.id,
        abi: BaseTemplateABI,
        publicClient: provider,
      });
      const contractOwner = await auctionContract.read.owner();
      if (contractOwner !== req.session.siwe.address)
        reject("You are not the owner of this contract");
      resolve({ metaData, auctionContract, provider });
    } catch (error: any) {
      reject(error.message);
    }
  });
};

const requireAvailableNetwork = (req: NextApiRequest): number => {
  if (!req.session.siwe) throw new Error("Sign in required");
  if (!isSupportedChain(req.session.siwe.chainId)) throw new Error("Wrong network");
  return req.session.siwe.chainId;
};

const getTokenInfo = async (tokenAddress: `0x${string}`, provider: PublicClient) => {
  const token = getContract({
    address: tokenAddress,
    abi: erc20ABI,
    publicClient: provider,
  });
  const result = await Promise.all([token.read.name(), token.read.symbol(), token.read.decimals()]);
  return {
    tokenName: result[0],
    tokenSymbol: result[1],
    tokenDecimal: result[2],
  };
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

        const dbClient = new DBClient({
          region: process.env._AWS_REGION as string,
          accessKey: process.env._AWS_ACCESS_KEY_ID as string,
          secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
          tableName: DYNAMODB_TABLES[requestedChain.id],
        });
        const metaData = await dbClient.scanMetaData(
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
        if (Number(chainId) !== sessionChainId) throw new Error("Network does not match");

        const dbClient = new DBClient({
          region: process.env._AWS_REGION as string,
          accessKey: process.env._AWS_ACCESS_KEY_ID as string,
          secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
          tableName: DYNAMODB_TABLES[sessionChainId],
        });

        const { metaData } = await requireContractOwner(req);
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
        if (Number(chainId) !== sessionChainId) throw new Error("Network does not match");

        const dbClient = new DBClient({
          region: process.env._AWS_REGION as string,
          accessKey: process.env._AWS_ACCESS_KEY_ID as string,
          secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
          tableName: DYNAMODB_TABLES[sessionChainId],
        });

        const { metaData } = await requireContractOwner(req);
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
