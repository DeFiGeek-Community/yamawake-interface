import { useContext, useEffect, useState } from "react";
import Router from "next/router";
import { useAccount, useNetwork } from "wagmi";
import {
  Spinner,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
} from "@chakra-ui/react";
import CurrentUserContext from "ui/contexts/CurrentUserContext";
import LayoutContext from "ui/contexts/LayoutContext";
import EarlyUserReward from "ui/components/dashboard/EarlyUserReward";
import SubChainEarlyUserReward from "ui/components/dashboard/SubChainEarlyUserReward";
import VeReward from "ui/components/dashboard/VeReward";
import MyAuctions from "ui/components/dashboard/MyAuctions";
import ParticipatedAuctions from "ui/components/dashboard/ParticipatedAuctions";
import { useLocale } from "ui/hooks/useLocale";
import { getSupportedChain } from "lib/utils/chain";
import type { ChainInfo } from "lib/constants/chains";

export default function DashboardPage() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { currentUser } = useContext(CurrentUserContext);
  const { t } = useLocale();

  const [chainInfo, setChainInfo] = useState<ChainInfo | undefined>(undefined);
  const { setAllowNetworkChange } = useContext(LayoutContext);
  setAllowNetworkChange && setAllowNetworkChange(true);

  useEffect(() => {
    if (!chain) {
      setChainInfo(undefined);
    } else {
      setChainInfo(getSupportedChain(chain.id));
    }
  }, [chain]);

  if (typeof currentUser === "undefined") {
    return (
      <Container maxW="container.lg" py={16} textAlign="center">
        <Spinner />
      </Container>
    );
  } else if (currentUser === null && typeof address === "undefined") {
    Router.push("/");
    return (
      <Container maxW="container.lg" py={16} textAlign="center">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={16}>
      <Heading size={"lg"}>{t("DASHBOARD")}</Heading>

      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
        gap={4}
        mt={{ base: 4, md: 8 }}
      >
        {!!chainInfo && !chainInfo.sourceId && (
          <EarlyUserReward chainId={chainInfo.id} address={address} />
        )}
        {!!chainInfo && !!chainInfo.sourceId && (
          <SubChainEarlyUserReward chainId={chainInfo.id} address={address} />
        )}
        <VeReward />
      </Grid>

      <Tabs mt={{ base: 4, md: 8 }}>
        <TabList>
          {currentUser && <Tab>{t("YOUR_SALES")}</Tab>}
          <Tab>{t("PARTICIPATED_SALES")}</Tab>
        </TabList>

        <TabPanels>
          {currentUser && (
            <TabPanel p={{ base: 0, md: 4 }}>
              {!!chain && !!address && <MyAuctions chainId={chain.id} address={address} />}
            </TabPanel>
          )}
          <TabPanel p={{ base: 0, md: 4 }}>
            {!!chain && !!address && <ParticipatedAuctions chainId={chain.id} address={address} />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
