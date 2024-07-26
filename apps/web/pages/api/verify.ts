import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { getSupportedChain } from "lib/utils/chain";
import { IronSessionOptions } from "iron-session";
import { getContract, isAddress, PublicClient } from "viem";
import SafeABI from "lib/constants/abis/Safe.json";
import { getViemProvider } from "lib/utils/serverside";

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
    case "POST":
      try {
        const { message, signature, chainId } = req.body;
        const siweMessage = new SiweMessage(message);
        const chain = getSupportedChain(Number(chainId));
        if (!chain) throw Error("Unsupported chain");

        const chainName =
          chain.name.toLowerCase() === "ethereum" ? "mainnet" : chain.name.toLowerCase();

        // Requires ethersjs provider for EIP1271
        // Reference) https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/client.ts#L348C15-L348C22
        const provider = new ethers.JsonRpcProvider(
          ["foundry", "hardhat", "localhost"].includes(chainName)
            ? `http://localhost:8545`
            : chain.rpcUrls.public.http[0],
        );

        const fields = await siweMessage.verify({ signature }, { provider });

        if (fields.data.nonce !== req.session.nonce)
          return res.status(422).json({ message: "Invalid nonce." });
        if (fields.data.chainId !== chain.id)
          return res.status(422).json({ message: "Invalid chain." });

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

          if (!isOwner) return res.status(422).json({ ok: false });
        } else {
          // To ensure that resources are emply
          delete fields.data.resources;
        }

        req.session.siwe = fields.data;
        await req.session.save();
        res.json({ ok: true });
      } catch (_error) {
        res.status(422).json({ ok: false });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
