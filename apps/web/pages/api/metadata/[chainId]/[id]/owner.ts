import { NextApiRequest, NextApiResponse } from "next";
import { PublicClient, getContract } from "viem";
import { Chain } from "viem/chains";
import { getIronSession, type SessionOptions } from "iron-session";
import { getDefaultChain, getSupportedChain } from "lib/utils/chain";
import { getViemProvider } from "lib/utils/serverside";
import BaseTemplateABI from "lib/constants/abis/BaseTemplate.json";
import type { YamawakeSession } from "lib/types/iron-session";

const ironOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const getContractOwner = (
  session: YamawakeSession,
  contractAddress: `0x${string}`,
  chainId: number,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!session.siwe) return reject("Unauthorized");
    const provider = getViemProvider(chainId) as PublicClient;
    const auctionContract = getContract({
      address: contractAddress,
      abi: BaseTemplateABI,
      publicClient: provider,
    });
    try {
      const owner = (await auctionContract.read.owner()) as string;
      if (
        (!session.siwe.resources && owner === session.siwe.address) ||
        (session.siwe.resources && owner === session.siwe.resources[0])
      ) {
        resolve(owner);
      } else {
        reject("You are not the owner of this contract");
      }
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const session = await getIronSession(req, res, ironOptions);
  switch (method) {
    case "GET":
      try {
        const { id, chainId } = req.query;
        let requestedChain: Chain;
        if (typeof chainId === "string") {
          requestedChain = getSupportedChain(chainId) ?? getDefaultChain();
        } else {
          return res.status(404).end("No auction found");
        }

        const owner = await getContractOwner(session, id as `0x${string}`, Number(chainId));
        res.json({ owner });
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
