import useSWR, { SWRResponse } from "swr";
import { MetaData } from "lib/types/Auction";
import { getSupportedChain } from "lib/utils/chain";
import { useLocale } from "./useLocale";

const useSWRMetaData = (
  chainId: number | undefined,
  id: string,
  fallbackData?: MetaData | null,
): SWRResponse<{ metaData: MetaData } | undefined, Error> => {
  const { t } = useLocale();

  if (!chainId) return useSWR(undefined);

  const chain = getSupportedChain(chainId);
  if (!chain) return useSWR(undefined);

  const fetcher = (url: string): Promise<{ metaData: MetaData } | undefined> =>
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
        };
      });
  return useSWR<{ metaData: MetaData } | undefined, Error>(
    `/api/metadata/${chain.id}/${id}`,
    fetcher,
    {
      errorRetryCount: 2,
      fallbackData: fallbackData ? { metaData: fallbackData } : undefined,
    },
  );
};

export default useSWRMetaData;
