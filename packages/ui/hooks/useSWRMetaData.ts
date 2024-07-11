import useSWR, { SWRResponse } from "swr";
import { MetaData } from "lib/types/Auction";
import { LOCK_DURATION, FEE_RATE_PER_MIL, TEMPLATE_V1_NAME } from "lib/constants/templates";
import { useLocale } from "./useLocale";

export type Constants = { lockDuration: number; feeRatePerMil: number };

// Currently unused parameters
const constants = {
  lockDuration: LOCK_DURATION[TEMPLATE_V1_NAME],
  feeRatePerMil: FEE_RATE_PER_MIL[TEMPLATE_V1_NAME],
};

const useSWRMetaData = (
  id: string,
  fallbackData?: MetaData | null,
): SWRResponse<{ metaData: MetaData; constants: Constants } | undefined, Error> => {
  const { t } = useLocale();
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
          constants,
        };
      });
  return useSWR<{ metaData: MetaData; constants: Constants } | undefined, Error>(
    `/api/metadata/${id}`,
    fetcher,
    {
      errorRetryCount: 2,
      fallbackData: fallbackData ? { metaData: fallbackData, constants } : undefined,
    },
  );
};

export default useSWRMetaData;
