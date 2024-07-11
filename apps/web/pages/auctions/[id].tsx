import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useToast } from "@chakra-ui/react";
import { DBClient } from "lib/dynamodb/metaData";
import Layout from "ui/components/layouts/layout";
import MetaTags from "ui/components/layouts/MetaTags";
import useAuction from "ui/hooks/useAuction";
import useSWRMetaData from "ui/hooks/useSWRMetaData";
import { useLocale } from "ui/hooks/useLocale";
import AuctionDetail, { SkeletonAuction } from "ui/components/auctions/AuctionDetail";
import CustomError from "../_error";

export default function AuctionPage({ initialMetaData }: { initialMetaData: any }) {
  const { address } = useAccount();
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });

  const {
    data: auctionData,
    mutate: refetch,
    error: apolloError,
  } = useAuction(
    id as `0x${string}`,
    address ? (address.toLowerCase() as `0x${string}`) : (zeroAddress as `0x${string}`),
  );

  const {
    data: metaData,
    mutate,
    error: dynamodbError,
  } = useSWRMetaData(id as string, initialMetaData);
  if (!metaData) return <CustomError statusCode={404} />;

  if (apolloError || dynamodbError)
    toast({
      title: apolloError?.message || dynamodbError?.message,
      status: "error",
      duration: 5000,
    });

  if (!auctionData)
    return (
      <Layout>
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
      </Layout>
    );

  if (!auctionData.auction) return <CustomError statusCode={404} />;

  return (
    <Layout>
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params!;
  const dbClient = new DBClient({
    region: process.env._AWS_REGION as string,
    accessKey: process.env._AWS_ACCESS_KEY_ID as string,
    secretKey: process.env._AWS_SECRET_ACCESS_KEY as string,
    tableName: process.env._AWS_DYNAMO_TABLE_NAME as string,
  });
  const initialMetaData = await dbClient.fetchMetaData(id as string);
  return {
    props: {
      initialMetaData: initialMetaData ?? null,
    },
  };
}
