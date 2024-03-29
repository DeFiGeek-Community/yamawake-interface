import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useToast } from "@chakra-ui/react";
import Layout from "ui/components/layouts/layout";
import MetaTags from "ui/components/layouts/MetaTags";
import useAuction from "ui/hooks/useAuction";
import useSWRMetaData from "ui/hooks/useSWRMetaData";
import { useLocale } from "ui/hooks/useLocale";
import { zeroAddress } from "viem";
import CustomError from "../../_error";
import AuctionDetail, { SkeletonAuction } from "ui/components/auctions/AuctionDetail";
import { getSupportedChain } from "lib/utils/chain";

export default function AuctionPage() {
  const { address } = useAccount();
  const router = useRouter();
  const { id, chainId } = router.query;
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const chain = getSupportedChain(String(chainId));
  const {
    data: auctionData,
    mutate: refetch,
    error: apolloError,
  } = useAuction(
    id as `0x${string}`,
    address ? (address.toLowerCase() as `0x${string}`) : (zeroAddress as `0x${string}`),
    chain?.id,
  );
  const { data: metaData, mutate, error: dynamodbError } = useSWRMetaData(chain?.id, id as string);

  if (!chainId)
    return (
      <Layout>
        <SkeletonAuction />
      </Layout>
    );
  if (!chain) return <CustomError statusCode={404} />;

  if (apolloError || dynamodbError)
    toast({
      title: apolloError?.message || dynamodbError?.message,
      status: "error",
      duration: 5000,
    });

  if (!auctionData || !metaData)
    return (
      <Layout>
        <SkeletonAuction />
      </Layout>
    );

  if (!auctionData.auction) return <CustomError statusCode={404} />;

  return (
    <Layout>
      <MetaTags
        title={`${metaData.metaData.title ? metaData.metaData.title : t("SALES")} | ${t(
          "APP_NAME",
        )}`}
        description={
          metaData.metaData.description
            ? metaData.metaData.description
            : t("AN_INCLUSIVE_AND_TRANSPARENT_TOKEN_LAUNCHPAD").replace(/\n/g, "")
        }
        image={metaData.metaData.logoURL && metaData.metaData.logoURL}
      />
      <AuctionDetail
        chainId={chain.id}
        auctionProps={auctionData.auction}
        refetchAuction={refetch}
        metaData={metaData.metaData}
        refetchMetaData={mutate}
        contractAddress={id as `0x${string}`}
        address={address}
      />
    </Layout>
  );
}
