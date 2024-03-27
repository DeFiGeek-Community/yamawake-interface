import { useAccount } from "wagmi";
import { Flex, Button, Text, HStack } from "@chakra-ui/react";
import { AuctionProps } from "lib/types/Auction";
import { QueryType } from "lib/graphql/query";
import AuctionCard, { AuctionCardSkeleton } from "../auctions/AuctionCard";
import { useLocale } from "../../hooks/useLocale";
import { useSWRAuctions } from "../../hooks/useAuctions";

export default function ParticipatedAuctions({
  chainId,
  address,
}: {
  chainId: number;
  address: `0x${string}`;
}) {
  const {
    auctions: participatedAuctions,
    isLoading: isLoadingParticipatedAuctions,
    mutate: mutateParticipatedAuctions,
    loadMoreAuctions: loadMoreParticipatedAuctions,
    isValidating: isValidatingParticipatedAuctions,
    isLast: isLastParticipatedAuction,
  } = useSWRAuctions(
    { id: String(address).toLowerCase() as `0x${string}` },
    QueryType.PARTICIPATED_SALE_QUERY,
    chainId,
  );
  const { t } = useLocale();

  return (
    <HStack mt={4} spacing={8} w={"full"} flexWrap={"wrap"}>
      {isLoadingParticipatedAuctions || !participatedAuctions ? (
        <>
          <AuctionCardSkeleton />
          <AuctionCardSkeleton />
          <AuctionCardSkeleton />
        </>
      ) : (
        participatedAuctions.map((auctionProps: AuctionProps) => {
          return (
            <AuctionCard chainId={chainId} key={auctionProps.id} auctionProps={auctionProps} />
          );
        })
      )}
      {!isLastParticipatedAuction && participatedAuctions.length > 0 && (
        <Button
          isLoading={isLoadingParticipatedAuctions || isValidatingParticipatedAuctions}
          onClick={loadMoreParticipatedAuctions}
        >
          {t("LOAD_MORE_SALES")}
        </Button>
      )}
      {!isLoadingParticipatedAuctions &&
        participatedAuctions &&
        participatedAuctions.length === 0 && (
          <Flex minH={"25vh"} justifyContent="center" alignItems={"center"}>
            <Text fontSize={"lg"} opacity={".75"} textAlign={"center"}>
              {t("NO_SALE")}
            </Text>
          </Flex>
        )}
    </HStack>
  );
}
