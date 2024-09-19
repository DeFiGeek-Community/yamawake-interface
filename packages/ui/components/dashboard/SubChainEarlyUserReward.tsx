import { useEffect, useState } from "react";
import { decodeEventLog, zeroAddress } from "viem";
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
  Link,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  QuestionIcon,
  TimeIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { formatEtherInBig } from "lib/utils";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { CHAIN_INFO } from "lib/constants/chains";
import { CCIP_MESSAGE_STATES } from "lib/constants/ccip";
import type { DecodedLog, CCIPSendRequestedEventArgs, FeeToken } from "lib/types/ccip";
import { useLocale } from "../../hooks/useLocale";
import useSubChainEarlyUserReward from "../../hooks/useSubChainEarlyUserReward";
import TxSentToast from "../shared/TxSentToast";
import useApprove from "../../hooks/useApprove";
import useCCIPStatus from "../../hooks/useCCIPStatus";

import OnrampABI from "lib/constants/abis/Onramp.json";

export default function SubChainEarlyUserReward({
  chainId,
  address,
  safeAddress,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
}) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();

  const sourceChain = CHAIN_INFO[chainId];
  const destinationChainId = sourceChain.sourceId!;
  const destinationChain = CHAIN_INFO[destinationChainId];
  const ccipMessageKey = `ccipMessage${chainId}`;
  const feeTokens: FeeToken[] = [
    { symbol: "ETH", address: zeroAddress },
    { symbol: "WETH", address: CONTRACT_ADDRESSES[chainId].WETH },
    { symbol: "LINK", address: CONTRACT_ADDRESSES[chainId].LINK },
  ];
  const [feeTokenIndex, setFeeTokenIndex] = useState<number>(0);
  const [shouldClaim, setShouldClaim] = useState<boolean>(true);
  const [ccipMessageId, setCcipMessageId] = useState<string | null>(null);

  const { readScore, sendScore, waitFn, fee } = useSubChainEarlyUserReward({
    chainId,
    address,
    safeAddress,
    feeToken: feeTokens[feeTokenIndex].address,
    shouldClaim,
    onSuccessWrite: (data: any) => {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 10000,
        render: safeAddress ? undefined : (props) => <TxSentToast txid={data?.hash} {...props} />,
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
        description: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });

      for (let i = 0; i < data.logs.length; i++) {
        try {
          // TODO
          // Safe対応
          const decodedLog = decodeEventLog({
            abi: OnrampABI,
            data: data.logs[i].data,
            topics: data.logs[i].topics,
          }) as DecodedLog<{ message?: CCIPSendRequestedEventArgs }>;
          if (decodedLog.eventName === "CCIPSendRequested") {
            const messageId = decodedLog.args.message?.messageId;
            if (!messageId) {
              console.warn("Found CCIPSendRequested event but no messageId detected");
              return;
            }
            // Set messageId to local storage
            localStorage.setItem(ccipMessageKey, messageId);
          }
          break;
        } catch (e) {
          continue;
        }
      }
    },
  });

  const approvals = useApprove({
    chainId,
    targetAddress: feeTokens[feeTokenIndex].address,
    owner: safeAddress || address || "0x",
    spender: CONTRACT_ADDRESSES[chainId].DISTRIBUTOR,
    enabled: (!!safeAddress || !!address) && feeTokens[feeTokenIndex].address !== zeroAddress,
    amount: fee.data,
    onSuccessWrite(data) {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 10000,
        render: safeAddress ? undefined : (props) => <TxSentToast txid={data.hash} {...props} />,
      });
    },
    onSuccessConfirm(data) {
      toast({
        title: t("APPROVAL_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    const messageId = localStorage.getItem(ccipMessageKey);
    setCcipMessageId(messageId);
  }, [chainId]);

  const status = useCCIPStatus({
    sourceChainId: chainId,
    destinationChainId: destinationChainId,
    messageId: ccipMessageId,
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
              {t("CCIP_FEE_PAYMENT_TOKEN")}
              <Tooltip
                hasArrow
                label={t("CCIP_FEE_PAYMENT_TOKEN_HELP", {
                  sourceChainName: sourceChain.name,
                  destinationChainName: destinationChain.name,
                })}
              >
                <QuestionIcon fontSize={"md"} mb={1} ml={1} />
              </Tooltip>
            </chakra.p>
            <Select
              isDisabled={false}
              id="feeToken"
              name="feeToken"
              defaultValue={0}
              onChange={(ev) => setFeeTokenIndex(parseInt(ev.target.value))}
              maxW={"150px"}
            >
              {feeTokens.map((feeToken, index) => (
                <option key={index} value={index}>
                  {feeToken.symbol}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack justifyContent={"space-between"} mt={2}>
            <chakra.p color={"gray.400"}>
              {t("CLAIM_REWARD_WHILE_TRANSFERING_SCORES_TO_L1")}
              <Tooltip
                hasArrow
                label={t("CLAIM_REWARD_WHILE_TRANSFERING_SCORES_TO_L1_HELP", {
                  destinationChainName: destinationChain.name,
                })}
              >
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
            <chakra.p color={"gray.400"}>{t("FEE")}</chakra.p>
            <chakra.p fontSize={"2xl"}>
              {fee.data ? formatEtherInBig(fee.data.toString()).toFixed(3) : "-"}
              <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
                {feeTokens[feeTokenIndex].symbol}
                <chakra.span fontSize={"xs"}> + TX Fee</chakra.span>
              </chakra.span>
            </chakra.p>
          </HStack>
          <Flex justifyContent={"flex-end"} mt={2}>
            {feeTokenIndex > 0 && !!fee.data && approvals.allowance < fee.data ? (
              <Button
                variant="solid"
                colorScheme="blue"
                onClick={approvals.writeFn.write}
                isLoading={approvals.writeFn.isLoading || approvals.waitFn.isLoading}
                isDisabled={!approvals.writeFn.write || !fee.data}
              >
                {t("APPROVE_TOKEN")}
              </Button>
            ) : (
              <Button
                isLoading={
                  readScore.isLoading ||
                  typeof readScore.data === "undefined" ||
                  sendScore?.isLoading ||
                  waitFn?.isLoading ||
                  fee.isLoading
                }
                isDisabled={!readScore.data || !sendScore.write || !fee.data}
                onClick={() => {
                  sendScore.write?.();
                }}
                variant={"solid"}
                colorScheme="green"
              >
                {shouldClaim ? t("TRANSFER_SCORE_TO_L1_WITH_CLAIM") : t("TRANSFER_SCORE_TO_L1")}
              </Button>
            )}
          </Flex>
          {ccipMessageId && status && (
            <Box mt={2}>
              <Heading fontSize={"sm"}>{t("TRANSACTION")}</Heading>
              <HStack justifyContent={"space-between"} mt={2}>
                <chakra.p color={"gray.400"}>
                  <Link href={`https://ccip.chain.link/msg/${ccipMessageId}`} target="_blank">
                    {`${ccipMessageId.slice(0, 14)}...${ccipMessageId.slice(-14)}`}
                    <ExternalLinkIcon ml={2} />
                  </Link>
                </chakra.p>
                <Flex alignItems={"center"}>
                  {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.UNTOUCHED && (
                    <TimeIcon fontSize={"lg"} />
                  )}
                  {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.IN_PROGRESS && (
                    <Spinner fontSize={"lg"} />
                  )}
                  {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.SUCCESS && (
                    <CheckCircleIcon fontSize={"lg"} color={"green.300"} />
                  )}
                  {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.FAILURE && (
                    <WarningIcon fontSize={"lg"} color={"red.300"} />
                  )}
                  <chakra.span ml={2}>{status}</chakra.span>
                </Flex>
              </HStack>
            </Box>
          )}
        </Box>
      </CardFooter>
    </Card>
  );
}
