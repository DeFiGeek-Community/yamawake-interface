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
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useLocale } from "../../hooks/useLocale";
import { QuestionIcon } from "@chakra-ui/icons";
import useEarlyUserReward from "../../hooks/useEarlyUserReward";
import { formatEtherInBig } from "lib/utils";
import TxSentToast from "../shared/TxSentToast";

export default function EarlyUserReward({ address }: { address: `0x${string}` }) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();
  const { readFn, writeFn, waitFn } = useEarlyUserReward({
    address,
    onSuccessWrite: (data: any) => {
      toast({
        title: "Transaction sent!",
        status: "success",
        duration: 5000,
        render: (props) => <TxSentToast txid={data?.hash} {...props} />,
      });
    },
    onErrorWrite: (e: Error) => {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
    onSuccessConfirm: (data: any) => {
      toast({
        description: `Transaction confirmed!`,
        status: "success",
        duration: 5000,
      });
    },
  });

  return (
    <Card flex={1}>
      <CardBody>
        <Heading fontSize={"xl"}>
          {t("EARLY_USER_REWARD")}
          <Tooltip
            hasArrow
            label={<Text whiteSpace={"pre-wrap"}>{t("EARLY_USER_REWARD_HELP")}</Text>}
          >
            <QuestionIcon fontSize={"md"} mb={1} ml={1} />
          </Tooltip>
        </Heading>
        <Divider mt={2} mb={4} />
        <HStack justifyContent={"space-between"}>
          <chakra.div color={"gray.400"}>{t("CLAIMABLE")}</chakra.div>
          <chakra.div fontSize={"2xl"}>
            {readFn.isLoading || typeof readFn.data === "undefined" ? (
              <Spinner />
            ) : (
              formatEtherInBig(readFn.data.toString()).toFixed(3)
            )}
            <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
              YMWK
            </chakra.span>
          </chakra.div>
        </HStack>
      </CardBody>
      <CardFooter pt={0} justifyContent={"flex-end"}>
        <Button
          isLoading={
            readFn.isLoading ||
            typeof readFn.data === "undefined" ||
            writeFn?.isLoading ||
            waitFn?.isLoading
          }
          isDisabled={(typeof readFn.data === "bigint" && readFn.data === 0n) || !writeFn.write}
          onClick={() => {
            writeFn.write?.();
          }}
          variant={"solid"}
          colorScheme="green"
        >
          {t("CLAIM")}
        </Button>
      </CardFooter>
    </Card>
  );
}
