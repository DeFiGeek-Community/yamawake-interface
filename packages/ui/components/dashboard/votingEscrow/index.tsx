import { Card, CardBody, Heading, Tooltip, Divider, Text } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { useLocale } from "../../../hooks/useLocale";
import LockStats from "./LockStats";
import Reward from "./Rewards";

export default function VotingEscrow({
  account,
  safeAddress,
}: {
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
        </Heading>
        <Divider mt={2} mb={4} />
        <LockStats account={account} safeAddress={safeAddress} />
        <Divider variant="dashed" py={2} />
        <Reward account={account} safeAddress={safeAddress} />
      </CardBody>
    </Card>
  );
}
