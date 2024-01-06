import {
  Button,
  useToast,
  Card,
  CardBody,
  Heading,
  Tooltip,
  Divider,
  HStack,
  chakra,
  CardFooter,
  VStack,
} from "@chakra-ui/react";
import { useLocale } from "../../../hooks/useLocale";
import { QuestionIcon } from "@chakra-ui/icons";
import VotingEscrow from "./VotingEsctow";
import Reward from "./Rewards";

export default function VeReward({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();

  return (
    <Card flex={1}>
      <CardBody>
        <Heading fontSize={"xl"}>
          {t("VE_YMWK_REWARD")}
          <Tooltip hasArrow label={t("COMMING_SOON")}>
            <QuestionIcon fontSize={"md"} mb={1} ml={1} />
          </Tooltip>
        </Heading>
        <Divider mt={2} mb={4} />
        <VotingEscrow address={address} />
        <Divider variant="dashed" py={2} />
        <Reward address={address} />
      </CardBody>
    </Card>
  );
}
