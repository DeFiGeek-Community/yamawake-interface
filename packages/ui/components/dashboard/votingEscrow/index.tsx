import { Card, CardBody, Heading, Tooltip, Divider, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";
import { useLocale } from "../../../hooks/useLocale";
import LockStats from "./LockStats";
import Reward from "./Rewards";
import { getEtherscanLink, getSupportedChain } from "lib/utils/chain";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

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

  return (
    <Card flex={1}>
      <CardBody>
        <Heading fontSize={"xl"}>
          {t("VE_YMWK")}
          <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>{t("VE_YMWK_REWARD_HELP")}</Text>}>
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
        </Heading>
        <Divider mt={2} mb={4} />
        <LockStats account={account} safeAddress={safeAddress} />
        <Divider variant="dashed" py={2} />
        <Reward account={account} safeAddress={safeAddress} />
      </CardBody>
    </Card>
  );
}
