import { chakra, Flex, Button, Text, HStack, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { AuctionProps } from "lib/types/Auction";
import { QueryType } from "lib/graphql/query";
import AuctionFormModal from "../auctions/AuctionFormModal";
import AuctionCard, { AuctionCardSkeleton } from "../auctions/AuctionCard";
import { useLocale } from "../../hooks/useLocale";
import { useSWRAuctions } from "../../hooks/useAuctions";

export default function MyAuctions({
  chainId,
  address,
  safeAddress,
}: {
  chainId: number;
  address: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
}) {
  const auctionFormModalDisclosure = useDisclosure();
  const {
    auctions: myAuctions,
    isLoading: isLoadingMyAuctions,
    mutate: mutateMyAuctions,
    loadMoreAuctions: loadMoreMyAuctions,
    isValidating: isValidatingMyAuctions,
    isLast: isLastMyAuction,
  } = useSWRAuctions(
    { id: String(safeAddress || address).toLowerCase() as `0x${string}` },
    QueryType.MY_SALE_QUERY,
    chainId,
  );
  const { t } = useLocale();

  return (
    <>
      <chakra.div mt={4} textAlign={"right"}>
        <Button onClick={auctionFormModalDisclosure.onOpen}>
          <AddIcon fontSize={"sm"} mr={2} />
          {t("CREATE_NEW_SALE")}
        </Button>
      </chakra.div>
      <AuctionFormModal
        chainId={chainId}
        address={address}
        safeAddress={safeAddress}
        isOpen={auctionFormModalDisclosure.isOpen}
        onClose={auctionFormModalDisclosure.onClose}
        onDeployConfirmed={mutateMyAuctions}
        onInformationSaved={() => setTimeout(mutateMyAuctions, 1000)}
      />
      <HStack mt={4} spacing={8} w={"full"} flexWrap={"wrap"}>
        {isLoadingMyAuctions || !myAuctions ? (
          <>
            <AuctionCardSkeleton />
            <AuctionCardSkeleton />
            <AuctionCardSkeleton />
          </>
        ) : (
          myAuctions.map((auctionProps: AuctionProps) => {
            return (
              <AuctionCard
                chainId={chainId}
                key={auctionProps.id}
                auctionProps={auctionProps}
                editable
              />
            );
          })
        )}
        {!isLastMyAuction && myAuctions.length > 0 && (
          <Button
            isLoading={isLoadingMyAuctions || isValidatingMyAuctions}
            onClick={loadMoreMyAuctions}
          >
            {t("LOAD_MORE_SALES")}
          </Button>
        )}
        {!isLoadingMyAuctions && myAuctions && myAuctions.length === 0 && (
          <Flex minH={"25vh"} justifyContent="center" alignItems={"center"}>
            <Text fontSize={"lg"} opacity={".75"} textAlign={"center"}>
              {t("NO_SALE")}
            </Text>
          </Flex>
        )}
      </HStack>
    </>
  );
}
