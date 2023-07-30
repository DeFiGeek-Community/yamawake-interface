import { ethers } from "ethers";
import SaleTemplateV1ABI from "lib/constants/abis/SaleTemplateV1.json";
import { CHAIN_NAMES } from "lib/constants";
import { Sale } from "lib/types/Sale";
import useSWR, { SWRResponse } from "swr";

export default function useSWRIsClaimed(
  sale: Sale,
  address: `0x${string}` | undefined
): SWRResponse<boolean | undefined, Error> {
  const chain = CHAIN_NAMES[process.env.NEXT_PUBLIC_CHAIN_ID as string];
  const infuraProvider = new ethers.providers.InfuraProvider(
    chain,
    process.env.NEXT_PUBLIC_INFURA_API_TOKEN
  );
  const etherscanProvider = new ethers.providers.EtherscanProvider(
    chain,
    process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  );
  const alchemyProvider = new ethers.providers.AlchemyProvider(
    chain,
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  );
  const provider = new ethers.providers.FallbackProvider([
    infuraProvider,
    etherscanProvider,
    alchemyProvider,
  ]);
  const saleContract = new ethers.Contract(
    sale.id as string,
    SaleTemplateV1ABI,
    provider
  );
  const filter = saleContract.filters.Claimed(address);

  const fetcher = (url: string): Promise<boolean | undefined> =>
    provider
      .getLogs({ ...filter, fromBlock: parseInt(sale.blockNumber) })
      .then((log) => log.length > 0);
  return useSWR<boolean | undefined, Error>(
    `isClaimed:${sale.id}-${address}`,
    fetcher
  );
}
