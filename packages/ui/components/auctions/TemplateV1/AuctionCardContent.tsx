import { useEffect, useState } from "react";
import {
  chakra,
  Link,
  Box,
  Divider,
  Skeleton,
  Heading,
  Card,
  CardBody,
  Progress,
  Text,
  Image,
  Stack,
  Flex,
  Button,
  useDisclosure,
  SkeletonText,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, QuestionIcon } from "@chakra-ui/icons";
import Big, { divideToNum, getBigNumber } from "lib/utils/bignumber";
import { AuctionProps, TemplateV1 } from "lib/types/Auction";
import useSWRMetaData from "../../../hooks/useSWRMetaData";
import MetaDataFormModal from "../MetaDataFormModal";
import {
  tokenAmountFormat,
  ellipsisText,
  getDecimalsForView,
  getTargetPercetage,
  etherAmountFormat,
  parseEtherInBig,
} from "lib/utils";
import { useLocale } from "../../../hooks/useLocale";
import AuctionCardCountdown from "../AuctionCardCountdown";

export default function AuctionCardContent({
  auctionProps,
  editable = false,
}: {
  auctionProps: AuctionProps;
  editable?: boolean;
}) {
  const auction = new TemplateV1(auctionProps);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { t, locale } = useLocale();
  const { data, mutate, error } = useSWRMetaData(auction.id as string);

  const card = (
    <Card
      w={{ base: "100%" }}
      direction={{ base: "column", md: "row" }}
      overflow="hidden"
      alignItems={"stretch"}
    >
      <Image
        objectFit="cover"
        w={{ base: "100%", md: "260px" }}
        h={{ base: "100%", md: "260px" }}
        maxW={{ base: "100%", md: "260px" }}
        boxShadow={"dark-lg"}
        src={
          data?.metaData?.logoURL
            ? data?.metaData?.logoURL
            : "https://dummyimage.com/400x400/718096/fff.png&text=No+Image"
        }
        alt={data?.metaData?.title}
      />

      <Stack w={"full"}>
        <CardBody>
          <Stack justifyContent={"space-between"} h={"full"}>
            <Flex flexDirection={{ base: "column", md: "row" }}>
              <chakra.div flex={11} pr={4}>
                <Heading size="lg">
                  {editable ? (
                    <Link _hover={{ opacity: 0.75 }} href={`/auctions/${auction.id}`}>
                      {data?.metaData?.title ? data?.metaData?.title : t("UNNAMED_SALE")}
                    </Link>
                  ) : (
                    <>{data?.metaData?.title ? data?.metaData?.title : t("UNNAMED_SALE")}</>
                  )}

                  {editable && (
                    <Button size={"sm"} ml={2} onClick={onOpen}>
                      <EditIcon mr={1} /> {t("EDIT")}
                    </Button>
                  )}
                </Heading>
                <Text py="2">
                  {data?.metaData?.description && ellipsisText(data?.metaData?.description, 160)}
                </Text>
              </chakra.div>
              <chakra.div flex={8}>
                <Flex justifyContent={"space-between"} alignItems={"baseline"}>
                  <chakra.span>{t("ALLOCATED_TO_THE_SALE")}</chakra.span>
                  <chakra.span fontSize={"2xl"}>
                    {tokenAmountFormat(
                      auction.allocatedAmount,
                      Number(auction.auctionToken.decimals),
                      getDecimalsForView(
                        getBigNumber(auction.allocatedAmount),
                        Number(auction.auctionToken.decimals),
                      ),
                    )}
                    <chakra.span fontSize={"md"}> {auction.auctionToken.symbol}</chakra.span>
                  </chakra.span>
                </Flex>
                <Divider />
                <Flex mt={2} justifyContent={"space-between"} alignItems={"baseline"}>
                  <chakra.span>{t("TOTAL_RAISED")}</chakra.span>{" "}
                  <chakra.span fontSize={"2xl"}>
                    {etherAmountFormat(auction.totalRaised[0].amount)}{" "}
                    <chakra.span fontSize={"md"}>ETH</chakra.span>
                  </chakra.span>
                </Flex>
                <Progress
                  borderRadius={"4px"}
                  hasStripe
                  value={
                    data?.metaData?.maximumTotalRaised
                      ? getTargetPercetage(
                          auction.totalRaised[0].amount,
                          parseEtherInBig(data.metaData.maximumTotalRaised),
                        )
                      : 0
                  }
                />
                <Flex mt={2} justifyContent={"space-between"} alignItems={"baseline"}>
                  <Text fontSize={"sm"}>
                    {t("MINIMUM_TOTAL_RAISED")}
                    <Tooltip
                      hasArrow
                      label={t(
                        "THE_SALE_WILL_BE_VOID_IF_THE_TOTAL_RAISED_IS_LESS_THAN_THIS_THRESHOLD",
                      )}
                    >
                      <QuestionIcon mb={1} ml={1} />
                    </Tooltip>
                  </Text>
                  <Text fontSize={"lg"}>
                    {etherAmountFormat(auction.minRaisedAmount, 3, false)}{" "}
                    <chakra.span fontSize={"sm"}>ETH</chakra.span>
                  </Text>
                </Flex>
                <Flex mt={1} justifyContent={"space-between"} alignItems={"baseline"}>
                  <Text fontSize={"sm"}>
                    {t("TARGET_TOTAL_RAISED")}
                    <Tooltip hasArrow label={t("TARGET_TOTAL_RAISED_EXPLANATION")}>
                      <QuestionIcon mb={1} ml={1} />
                    </Tooltip>
                  </Text>
                  <Text fontSize={"lg"}>
                    {data?.metaData?.targetTotalRaised
                      ? Number(data?.metaData?.targetTotalRaised).toFixed(3)
                      : "-"}{" "}
                    <chakra.span fontSize={"sm"}>ETH</chakra.span>
                  </Text>
                </Flex>
                {/* <Flex mt={1} justifyContent={'space-between'} alignItems={'baseline'}>
                                <Text fontSize={'sm'}>Target</Text><Text fontSize={'lg'}>{data?.metaData?.maximumTotalRaised ? tokenAmountFormat(data?.metaData?.maximumTotalRaised, 0, 2) : '-'} <chakra.span fontSize={'sm'}>ETH</chakra.span></Text>
                            </Flex> */}
              </chakra.div>
            </Flex>
            <AuctionCardCountdown
              startingAt={auction.startingAt}
              closingAt={auction.closingAt}
              mt={{ base: 2, md: 0 }}
              alignItems={"center"}
            />
          </Stack>
        </CardBody>
      </Stack>
      {editable && isOpen && (
        <MetaDataFormModal
          minRaisedAmount={divideToNum(auction.minRaisedAmount, Big(10).pow(18))}
          isOpen={isOpen}
          onClose={onClose}
          existingContractAddress={auction.id as `0x${string}`}
          auctionMetaData={data?.metaData}
          onSubmitSuccess={mutate}
        />
      )}
    </Card>
  );

  if (editable) {
    return card;
  } else {
    return (
      <Link
        href={`/auctions/${auction.id}`}
        transition={"filter"}
        transitionDuration={"0.3s"}
        w={{ base: "100%" }}
        _hover={{
          textDecoration: "none",
          filter: "brightness(115%)",
        }}
      >
        {card}
      </Link>
    );
  }
}

export const AuctionCardSkeleton = () => {
  return (
    <Card direction={{ base: "column", sm: "row" }} overflow="hidden">
      <Box p={6}>
        <Skeleton
          w={{ base: "100%", sm: "260px" }}
          h={{ base: "100%", sm: "260px" }}
          maxW={{ base: "100%", sm: "260px" }}
        />
      </Box>

      <Stack w={"full"}>
        <CardBody>
          <Flex>
            <chakra.div flex={10} pr={4}>
              <Skeleton h={"20px"} />
              <SkeletonText py="4" />
            </chakra.div>
            <Stack flex={7} spacing={4}>
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Divider />
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Skeleton h={"20px"} borderRadius={"4px"} />
            </Stack>
          </Flex>
        </CardBody>
      </Stack>
    </Card>
  );
};
