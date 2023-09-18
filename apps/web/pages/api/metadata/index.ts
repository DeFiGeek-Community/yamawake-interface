import { NextApiRequest, NextApiResponse } from "next";
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
import { Chain } from "viem/chains";
import { getChain } from "lib/utils/chain";
import { scanMetaData, addMetaData, updateAuction } from "lib/dynamodb/metaData";
import BaseTemplateABI from "lib/constants/abis/BaseTemplate.json";
import ironOptions from "lib/constants/ironOptions";

const availableNetwork = [Number(process.env.NEXT_PUBLIC_CHAIN_ID)];

const getViemProvider = (chainId: number) => {
  const chain = getChain(chainId);
  const chainName = chain.name.toLowerCase();
  // const alchemy = http(`https://eth-${chainName}.g.alchemy.com/v2/${}`)
  const infura = http(
    `https://${chainName}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`,
  );
  const client = createPublicClient({
    // chain: getViemChain(chainName),
    chain,
    transport: fallback([infura]),
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

const requireAvailableNetwork = (req: NextApiRequest) => {
  if (!req.session.siwe) throw new Error("Sign in required");
  if (!availableNetwork.includes(req.session.siwe.chainId)) throw new Error("Wrong network");
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
        const { lastEvaluatedKeyId, lastEvaluatedKeyCreatedAt } = req.query;
        const metaData = await scanMetaData(
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
        requireAvailableNetwork(req);
        const { metaData } = await requireContractOwner(req);
        const result = await addMetaData(metaData);
        res.json({ result });
      } catch (_error) {
        console.log(_error);
        res.status(500).end(String(_error));
      }
      break;
    case "PUT":
      try {
        requireAvailableNetwork(req);
        const { metaData } = await requireContractOwner(req);
        const result = await updateAuction(metaData);
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
