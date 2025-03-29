import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ethers, Network } from "ethers";
import { getRPCEndpoints, getSupportedChain } from "lib/utils/chain";
import { getIronSession, type SessionOptions } from "iron-session";
import { getContract, isAddress, PublicClient } from "viem";
import SafeABI from "lib/constants/abis/Safe.json";
import { getViemProvider } from "lib/utils/serverside";
import { YamawakeSession } from "lib/types/iron-session";

const ironOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const session = await getIronSession<YamawakeSession>(req, res, ironOptions);
  switch (method) {
    case "POST":
      try {
        const { message, signature, chainId } = req.body;
        const siweMessage = new SiweMessage(message);
        const chain = getSupportedChain(Number(chainId));
        if (!chain) throw Error("Unsupported chain");

        const endpoints = getRPCEndpoints(chain.id);
        if (endpoints.length === 0) throw Error("RPC endpoint not found");
        // Requires ethersjs provider for EIP1271
        // Reference) https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/client.ts#L348C15-L348C22
        const provider = new ethers.JsonRpcProvider(
          endpoints[0].toString(),
          Network.from(chain.id),
          { staticNetwork: true },
        );

        const fields = await siweMessage.verify({ signature }, { provider });

        if (fields.data.nonce !== session.nonce)
          return res.status(422).json({ error: "Invalid nonce." });
        if (fields.data.chainId !== chain.id)
          return res.status(422).json({ error: "Invalid chain." });

        if (fields.data.resources && isAddress(fields.data.resources[0])) {
          // Sign in as a Safe address owner
          const safeAddress = fields.data.resources[0];
          const publicClient = getViemProvider(chain.id) as PublicClient;
          const safeAccount = getContract({
            address: safeAddress,
            abi: SafeABI,
            publicClient,
          });
          const isOwner = await safeAccount.read.isOwner([fields.data.address]);

          if (!isOwner)
            return res.status(422).json({
              error: `${fields.data.address} is not a owner of ${safeAddress}`,
            });
        } else {
          // To ensure that resources are emply
          delete fields.data.resources;
        }

        session.siwe = fields.data;
        await session.save();
        res.json({ ok: true });
      } catch (_error: unknown) {
        res.status(422).json({ error: _error instanceof Error ? _error.message : String(_error) });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
