import { useContext } from "react";
import {
  Container,
  Button,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AuctionProps } from "lib/types/Auction";
import AuctionCard, { AuctionCardSkeleton } from "ui/components/auctions/AuctionCard";
import { useSWRAuctions } from "ui/hooks/useAuctions";
import { useRequestedChain } from "ui/hooks/useRequestedChain";
import { QueryType } from "lib/graphql/query";
import { useLocale } from "ui/hooks/useLocale";
import LayoutContext from "ui/contexts/LayoutContext";
import MetaTags from "ui/components/layouts/MetaTags";
import CustomError from "../../_error";

export default function AuctionPage() {
  const { t } = useLocale();
  const { requestedChain, falledBack } = useRequestedChain({
    redirectOnSwitchNetwork: true,
  });

  const {
    auctions: activeAuctions,
    isLast: isLastActiveAuctions,
    isLoading: isLoadingActiveAuctions,
    isValidating: isValidatingActiveAuctions,
    error: activeAuctionsError,
    loadMoreAuctions: loadMoreActiveAuctions,
  } = useSWRAuctions({}, QueryType.ACTIVE_AND_UPCOMING, requestedChain?.id);
  // const { auctions: activeAuctions, isLast: isLastActiveAuctions, isLoading: isLoadingActiveAuctions, isValidating: isValidatingActiveAuctions, error: activeAuctionsError, loadMoreAuctions: loadMoreActiveAuctions } = useSWRAuctions({}, QueryType.ACTIVE);
  // const { auctions: upcomingAuctions, isLast: isLastUpcomingAuctions, isLoading: isLoadingUpcomingAuctions, isValidating: isValidatingUpcomingAuctions, error: upcomingAuctionsError, loadMoreAuctions: loadMoreUpcomingAuctions } = useSWRAuctions({}, QueryType.UPCOMING);
  const {
    auctions: closedAuctions,
    isLast: isLastClosedAuctions,
    isLoading: isLoadingClosedAuctions,
    isValidating: isValidatingClosedAuctions,
    error: closedAuctionsError,
    loadMoreAuctions: loadMoreClosedAuctions,
  } = useSWRAuctions({}, QueryType.CLOSED, requestedChain?.id);

  const { setAllowNetworkChange } = useContext(LayoutContext);
  setAllowNetworkChange && setAllowNetworkChange(true);

  if (falledBack) return <CustomError statusCode={404} />;

  return (
    <>
      <MetaTags title={`${t("LIVE_UPCOMING_SALES")} | ${t("APP_NAME")}`} />
      <Container maxW="container.xl" py={16}>
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab fontSize={{ base: "sm", md: "md" }}>{t("LIVE_UPCOMING_SALES")}</Tab>
            {/* <Tab fontSize={{base: 'sm', md: 'md'}}>Live Auctions</Tab>
                    <Tab fontSize={{base: 'sm', md: 'md'}}>Upcoming Auctions</Tab> */}
            <Tab fontSize={{ base: "sm", md: "md" }}>{t("ENDED_SALES")}</Tab>
          </TabList>
          <TabPanels mt={4}>
            <TabPanel p={{ base: 0, md: 4 }}>
              <HStack spacing={8} w={"full"} flexWrap={"wrap"}>
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
                {!isLastActiveAuctions && activeAuctions.length > 0 && (
                  <Button
                    isLoading={isLoadingActiveAuctions || isValidatingActiveAuctions}
                    onClick={loadMoreActiveAuctions}
                  >
                    {t("LOAD_MORE_SALES")}
                  </Button>
                )}
                {!isLoadingActiveAuctions && activeAuctions.length === 0 && (
                  <Flex minH={"25vh"} justifyContent="center" alignItems={"center"}>
                    <Text fontSize={"lg"} opacity={".75"} textAlign={"center"}>
                      {t("NO_SALE")}
                    </Text>
                  </Flex>
                )}
              </HStack>
            </TabPanel>

            {/* <TabPanel p={{base: 0, md: 4}}>
                        <HStack spacing={8} w={"full"} flexWrap={"wrap"}>
                            {
                                upcomingAuctionsError && <Alert status={'error'}><AlertIcon />{upcomingAuctionsError.message}</Alert>
                            }
                            {
                                isLoadingUpcomingAuctions ? <>
                                    <AuctionCardSkeleton /><AuctionCardSkeleton /><AuctionCardSkeleton />
                                </> 
                                : upcomingAuctions.map((auctionProps: AuctionProps) => {
                                    return <AuctionCard key={auctionProps.id} auctionProps={auctionProps} />
                                })
                            }
                            {
                                !isLastUpcomingAuctions && upcomingAuctions.length > 0 && <Button isLoading={isLoadingUpcomingAuctions || isValidatingUpcomingAuctions} onClick={loadMoreUpcomingAuctions}>Load more auctions</Button>
                            }
                            {
                                !isLoadingUpcomingAuctions && upcomingAuctions.length === 0 && <Flex minH={'25vh'} justifyContent='center' alignItems={'center'}>
                                    <Text fontSize={'lg'} opacity={'.75'} textAlign={'center'}>No auctions</Text>
                                </Flex>
                            }
                        </HStack>
                    </TabPanel> */}

            <TabPanel p={{ base: 0, md: 4 }}>
              <HStack spacing={8} w={"full"} flexWrap={"wrap"}>
                {closedAuctionsError && (
                  <Alert status={"error"}>
                    <AlertIcon />
                    {closedAuctionsError.message}
                  </Alert>
                )}
                {isLoadingClosedAuctions ? (
                  <>
                    <AuctionCardSkeleton />
                    <AuctionCardSkeleton />
                    <AuctionCardSkeleton />
                  </>
                ) : (
                  closedAuctions.map((auctionProps: AuctionProps) => {
                    return (
                      <AuctionCard
                        chainId={requestedChain.id}
                        key={auctionProps.id}
                        auctionProps={auctionProps}
                      />
                    );
                  })
                )}
                {!isLastClosedAuctions && closedAuctions.length > 0 && (
                  <Button
                    isLoading={isLoadingClosedAuctions || isValidatingClosedAuctions}
                    onClick={loadMoreClosedAuctions}
                  >
                    {t("LOAD_MORE_SALES")}
                  </Button>
                )}
                {!isLoadingClosedAuctions && closedAuctions.length === 0 && (
                  <Flex minH={"25vh"} justifyContent="center" alignItems={"center"}>
                    <Text fontSize={"lg"} opacity={".75"} textAlign={"center"}>
                      {t("NO_SALE")}
                    </Text>
                  </Flex>
                )}
              </HStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
}
