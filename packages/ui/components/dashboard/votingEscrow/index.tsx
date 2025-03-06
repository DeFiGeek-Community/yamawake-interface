import {
  Card,
  CardBody,
  Heading,
  Tooltip,
  Divider,
  Text,
  Link,
  HStack,
  Box,
  VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";
import { useLocale } from "../../../hooks/useLocale";
import LockStats from "./LockStats";
import Reward from "./Rewards";
import { getEtherscanLink, getSupportedChain } from "lib/utils/chain";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import useYMWKAPR from "../../../hooks/RewardGauge/useYMWKAPR";

export default function VotingEscrow({
  chainId,
  account,
  safeAddress,
}: {
  chainId: number;
  account?: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
}) {
  const { t } = useLocale();
  const { aprStr } = useYMWKAPR();

  return (
    <Card flex={1}>
      <CardBody>
        <Heading fontSize={"xl"}>
          <HStack justifyContent={"space-between"} alignItems={"baseline"}>
            <Box>
              {t("VE_YMWK")}
              <Tooltip
                hasArrow
                label={<Text whiteSpace={"pre-wrap"}>{t("VE_YMWK_REWARD_HELP")}</Text>}
              >
                <QuestionIcon fontSize={"md"} mb={1} ml={1} />
              </Tooltip>
              <Link
                href={getEtherscanLink(
                  getSupportedChain(chainId),
                  CONTRACT_ADDRESSES[chainId].VOTING_ESCROW,
                  "token",
                )}
                target={"_blank"}
              >
                <ExternalLinkIcon ml={2} mb={1} />
              </Link>
            </Box>
            <VStack alignItems={"flex-end"}>
              <Text fontSize={"sm"} color={"gray.400"}>
                YMWK APR: {aprStr}{" "}
                <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>{t("YMWK_APR_HELP")}</Text>}>
                  <QuestionIcon fontSize={"md"} mb={1} ml={1} />
                </Tooltip>
              </Text>
              <Text fontSize={"sm"} color={"gray.400"} mt={-1}>
                Last Week ETH APR: ---％{" "}
                <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>{t("ETH_APR_HELP")}</Text>}>
                  <QuestionIcon fontSize={"md"} mb={1} ml={1} />
                </Tooltip>
              </Text>
            </VStack>
          </HStack>
        </Heading>
        <Divider mt={2} mb={4} />
        <LockStats account={account} safeAddress={safeAddress} />
        <Divider variant="dashed" py={2} />
        <Reward account={account} safeAddress={safeAddress} />
      </CardBody>
    </Card>
  );
}
