import { useState } from "react";
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
  Box,
  Flex,
  Select,
  Switch,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { formatEtherInBig } from "lib/utils";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { useLocale } from "../../hooks/useLocale";
import useSubChainEarlyUserReward from "../../hooks/useSubChainEarlyUserReward";
import TxSentToast from "../shared/TxSentToast";

export default function SubChainEarlyUserReward({
  chainId,
  address,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
}) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();

  const [feeToken, setFeeToken] = useState<`0x${string}`>("0x00");
  const [shouldClaim, setShouldClaim] = useState<boolean>(true);
  const { readScore, sendScore, waitFn, fee } = useSubChainEarlyUserReward({
    chainId,
    address,
    feeToken,
    shouldClaim,
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
            {readScore.isLoading || typeof readScore.data === "undefined" ? (
              <Spinner />
            ) : (
              formatEtherInBig(readScore.data.toString()).toFixed(3)
            )}
            <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
              YMWK
            </chakra.span>
          </chakra.div>
        </HStack>
      </CardBody>
      <CardFooter pt={0}>
        <Box w={"full"}>
          <Divider mt={2} mb={4} />
          <HStack justifyContent={"space-between"}>
            <chakra.p color={"gray.400"}>
              CCIP手数料支払いトークン
              <Tooltip hasArrow label={""}>
                <QuestionIcon fontSize={"md"} mb={1} ml={1} />
              </Tooltip>
            </chakra.p>
            <Select
              isDisabled={false}
              id="feeToken"
              name="feeToken"
              defaultValue={"0x00"}
              onChange={(ev) => setFeeToken(ev.target.value as `0x${string}`)}
              maxW={"150px"}
            >
              <option key={"eth"} value={"0x00"}>
                ETH
              </option>
              <option key={"weth"} value={CONTRACT_ADDRESSES[chainId].WETH}>
                WETH
              </option>
              <option key={"link"} value={CONTRACT_ADDRESSES[chainId].LINK}>
                LINK
              </option>
            </Select>
          </HStack>
          <HStack justifyContent={"space-between"} mt={2}>
            <chakra.p color={"gray.400"}>
              L1へのスコア移行と同時にリワードを請求する
              <Tooltip hasArrow label={""}>
                <QuestionIcon fontSize={"md"} mb={1} ml={1} />
              </Tooltip>
            </chakra.p>
            <Switch
              size={"lg"}
              colorScheme={"green"}
              defaultChecked={true}
              onChange={(ev) => setShouldClaim(ev.target.checked)}
            ></Switch>
          </HStack>
          <HStack justifyContent={"space-between"} mt={2}>
            <chakra.p color={"gray.400"}>手数料</chakra.p>
            <chakra.p fontSize={"2xl"}>
              {fee.data ? formatEtherInBig(fee.data.toString()).toFixed(3) : "-"}
              <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
                ETH<chakra.span fontSize={"xs"}> + TX Fee</chakra.span>
              </chakra.span>
            </chakra.p>
          </HStack>
          <Flex justifyContent={"flex-end"} mt={2}>
            <Button
              isLoading={
                readScore.isLoading ||
                typeof readScore.data === "undefined" ||
                sendScore?.isLoading ||
                waitFn?.isLoading
              }
              isDisabled={
                (typeof readScore.data === "bigint" && readScore.data === 0n) || !sendScore.write
              }
              onClick={() => {
                sendScore.write?.();
              }}
              variant={"solid"}
              colorScheme="green"
            >
              リワードスコアをL1に送信し、請求する
            </Button>
          </Flex>
        </Box>
      </CardFooter>
    </Card>
  );
}