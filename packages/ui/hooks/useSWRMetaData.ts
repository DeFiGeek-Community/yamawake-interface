import useSWR, { SWRResponse } from "swr";
import { hardhat } from "viem/chains";
import { MetaData } from "lib/types/Auction";
import { LOCK_DURATION, FEE_RATE_PER_MIL, TEMPLATE_V1_NAME } from "lib/constants/templates";
import { getSupportedChain } from "lib/utils/chain";
import { useLocale } from "./useLocale";

type Constants = { lockDuration: number; feeRatePerMil: number };

// const defaultChain =
//   getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)) ?? hardhat;

const useSWRMetaData = (
  chainId: number | undefined,
  id: string,
): SWRResponse<{ metaData: MetaData; constants: Constants } | undefined, Error> => {
  const { t } = useLocale();
  // if (!chainId) throw new Error("Wrong chain");
  if (!chainId) return useSWR(undefined);
  const chain = getSupportedChain(chainId);
  // if (!chain) throw new Error("Wrong chain");
  if (!chain) return useSWR(undefined);

  const fetcher = (
    url: string,
  ): Promise<{ metaData: MetaData; constants: Constants } | undefined> =>
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        return {
          metaData: data.metaData
            ? data.metaData
            : ({
                id,
                title: t("UNNAMED_SALE"),
              } as MetaData),
          constants: {
            lockDuration: LOCK_DURATION[TEMPLATE_V1_NAME],
            feeRatePerMil: FEE_RATE_PER_MIL[TEMPLATE_V1_NAME],
          },
        };
      });
  return useSWR<{ metaData: MetaData; constants: Constants } | undefined, Error>(
    `/api/metadata/${chain.id}/${id}`,
    fetcher,
    { errorRetryCount: 2 },
  );
};

export default useSWRMetaData;
