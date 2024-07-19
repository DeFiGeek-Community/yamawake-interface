import { useContext } from "react";
import Router from "next/router";
import { HStack, Container, Alert, AlertIcon, Heading, Text, Flex, Button } from "@chakra-ui/react";
import CurrentUserContext from "ui/contexts/CurrentUserContext";
import LayoutContext from "ui/contexts/LayoutContext";
import Hero from "ui/components/shared/Hero";
import AuctionCard, { AuctionCardSkeleton } from "ui/components/auctions/AuctionCard";
import { useSWRAuctions } from "ui/hooks/useAuctions";
import { useRequestedChain } from "ui/hooks/useRequestedChain";
import { useLocale } from "ui/hooks/useLocale";
import { AuctionProps } from "lib/types/Auction";
import { QueryType } from "lib/graphql/query";
import MetaTags from "ui/components/layouts/MetaTags";

export default function Web() {
  const { currentUser, mutate } = useContext(CurrentUserContext);
  const { setAllowNetworkChange } = useContext(LayoutContext);
  const { requestedChain } = useRequestedChain();
  const { t } = useLocale();
  setAllowNetworkChange && setAllowNetworkChange(true);

  const {
    auctions: activeAuctions,
    isLast: isLastActiveAuctions,
    isLoading: isLoadingActiveAuctions,
    isValidating: isValidatingActiveAuctions,
    error: activeAuctionsError,
    loadMoreAuctions: loadMoreActiveAuctions,
  } = useSWRAuctions(
    { first: 5, keySuffix: "top" },
    QueryType.ACTIVE_AND_UPCOMING,
    requestedChain.id,
  );

  return (
    <>
      <MetaTags />
      <Hero
        currentUser={currentUser}
        mutate={mutate}
        subtitle={t("AN_INCLUSIVE_AND_TRANSPARENT_TOKEN_LAUNCHPAD")}
      />
      <Container maxW={"container.xl"}>
        <Heading fontSize={{ base: "xl", md: "3xl" }}>{t("LIVE_UPCOMING_SALES")}</Heading>
        <HStack spacing={8} py={8} w={"full"} flexWrap={"wrap"}>
          {activeAuctionsError && (
            <Alert status={"error"}>
              <AlertIcon />
              {activeAuctionsError.message}
            </Alert>
          )}
          {isLoadingActiveAuctions ? (
            <>
              <AuctionCardSkeleton />
              <AuctionCardSkeleton />
              <AuctionCardSkeleton />
            </>
          ) : (
            activeAuctions.map((auctionProps: AuctionProps) => {
              return (
                <AuctionCard
                  chainId={requestedChain.id}
                  key={auctionProps.id}
                  auctionProps={auctionProps}
                />
              );
            })
          )}
          {!isLoadingActiveAuctions && activeAuctions.length === 0 && (
            <Flex minH={"25vh"} justifyContent="center" alignItems={"center"}>
              <Text fontSize={{ base: "md", md: "lg" }} opacity={".75"} textAlign={"center"}>
                {t("NO_LIVE_SALE")}
              </Text>
            </Flex>
          )}
        </HStack>
        <Flex alignItems={"center"} justifyContent={"center"} pb={8}>
          <Button
            size={{ base: "md", md: "lg" }}
            onClick={() => Router.push(`/auctions/${requestedChain.id}`)}
          >
            {t("VIEW_ALL_SALES")}
          </Button>
        </Flex>
      </Container>
    </>
  );
}
