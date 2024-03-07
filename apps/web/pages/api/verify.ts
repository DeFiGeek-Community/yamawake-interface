import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { getChain } from "lib/utils/chain";
import ironOptions from "lib/constants/ironOptions";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "POST":
      try {
        const { message, signature } = req.body;
        const siweMessage = new SiweMessage(message);
        const chain = getChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID));
        const chainName = chain.name.toLowerCase();
        const provider = new ethers.JsonRpcProvider(
          ["foundry", "hardhat", "localhost"].includes(chainName)
            ? `http://localhost:8545`
            : `https://${chainName}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`,
        );

        const fields = await siweMessage.verify({ signature }, { provider });

        if (fields.data.nonce !== req.session.nonce)
          return res.status(422).json({ message: "Invalid nonce." });

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
