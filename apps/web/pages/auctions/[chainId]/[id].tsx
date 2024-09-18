import { useContext } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useToast } from "@chakra-ui/react";
import { DBClient } from "lib/dynamodb/metaData";
import MetaTags from "ui/components/layouts/MetaTags";
import useAuction from "ui/hooks/useAuction";
import useSWRMetaData from "ui/hooks/useSWRMetaData";
import { useLocale } from "ui/hooks/useLocale";
import AuctionDetail, { SkeletonAuction } from "ui/components/auctions/AuctionDetail";
import { getSupportedChain } from "lib/utils/chain";
import LayoutContext from "ui/contexts/LayoutContext";
import CurrentUserContext from "ui/contexts/CurrentUserContext";
import type { MetaData } from "lib/types/Auction";
import CustomError from "../../_error";

export default function AuctionPage({ initialMetaData }: { initialMetaData: MetaData | null }) {
  const { address } = useAccount();
  const { currentUser } = useContext(CurrentUserContext);
  const router = useRouter();
  const { id, chainId } = router.query;
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const chain = getSupportedChain(String(chainId));
  const {
    data: auctionData,
    mutate: refetch,
    error: apolloError,
    isLoading,
    isValidating,
  } = useAuction(
    id as `0x${string}`,
    (currentUser?.safeAccount || address || zeroAddress).toLowerCase() as `0x${string}`,
    chain?.id,
  );
  const { data: metaData, mutate, error: dynamodbError } = useSWRMetaData(chain?.id, id as string);
  const { setAllowNetworkChange } = useContext(LayoutContext);
  setAllowNetworkChange && setAllowNetworkChange(false);

  if (!chainId || isLoading) return <SkeletonAuction />;
  if (!chain || !metaData) return <CustomError statusCode={404} />;

  if (apolloError || dynamodbError)
    toast({
      title: apolloError?.message || dynamodbError?.message,
      status: "error",
      duration: 5000,
    });

  if ((!auctionData || !auctionData.auction) && (isLoading || isValidating))
    return (
      <>
        <MetaTags
          title={`${metaData?.metaData.title ? metaData.metaData.title : t("SALES")} | ${t(
            "APP_NAME",
          )}`}
          description={
            metaData?.metaData.description
              ? metaData.metaData.description
              : t("AN_INCLUSIVE_AND_TRANSPARENT_TOKEN_LAUNCHPAD").replace(/\n/g, "")
          }
          image={metaData?.metaData.logoURL && metaData.metaData.logoURL}
        />
        <SkeletonAuction />
      </>
    );

  if (!auctionData.auction) return <CustomError statusCode={404} />;

  return (
    <>
      <MetaTags
        title={`${metaData?.metaData.title ? metaData.metaData.title : t("SALES")} | ${t(
          "APP_NAME",
        )}`}
        description={
          metaData?.metaData.description
            ? metaData.metaData.description
            : t("AN_INCLUSIVE_AND_TRANSPARENT_TOKEN_LAUNCHPAD").replace(/\n/g, "")
        }
        image={metaData?.metaData.logoURL && metaData.metaData.logoURL}
      />
      <AuctionDetail
        chainId={chain.id}
        auctionProps={auctionData.auction}
        refetchAuction={refetch}
        metaData={metaData.metaData}
        refetchMetaData={mutate}
        contractAddress={id as `0x${string}`}
        address={address}
        safeAddress={currentUser?.safeAccount}
      />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id, chainId } = context.params!;
  const dbClient = new DBClient({
    region: process.env._AWS_REGION as string,
    accessKey: process.env._AWS_ACCESS_KEY_ID as string,
    secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
    tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
  });
  const initialMetaData = await dbClient.fetchMetaData(id as string, parseInt(chainId as string));
  return {
    props: {
      initialMetaData: initialMetaData ?? null,
    },
  };
}
