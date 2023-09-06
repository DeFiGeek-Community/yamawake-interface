import { useContext } from "react";
import Router from "next/router";
import { useAccount } from "wagmi";
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
import Layout from "ui/components/layouts/layout";
import { CurrentUserContext } from "ui/components/providers/CurrentUserProvider";
import EarlyUserReward from "ui/components/dashboard/EarlyUserReward";
import VeReward from "ui/components/dashboard/VeReward";
import MyAuctions from "ui/components/dashboard/MyAuctions";
import ParticipatedAuctions from "ui/components/dashboard/ParticipatedAuctions";
import { useLocale } from "ui/hooks/useLocale";

export default function DashboardPage() {
  const { address, isConnected, connector } = useAccount();
  const { currentUser } = useContext(CurrentUserContext);
  const { t } = useLocale();

  if (typeof currentUser === "undefined") {
    return (
      <Layout>
        <Container maxW="container.lg" py={16} textAlign="center">
          <Spinner />
        </Container>
      </Layout>
    );
  } else if (currentUser === null && typeof address === "undefined") {
    Router.push("/");
    return (
      <Layout>
        <Container maxW="container.lg" py={16} textAlign="center">
          <Spinner />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={16}>
        <Heading size={"lg"}>{t("DASHBOARD")}</Heading>

        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          gap={4}
          mt={{ base: 4, md: 8 }}
        >
          <EarlyUserReward address={address as `0x${string}`} />
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
                <MyAuctions />
              </TabPanel>
            )}
            <TabPanel p={{ base: 0, md: 4 }}>
              <ParticipatedAuctions />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  );
}
