import { Button, HStack, VStack, Spinner, Tooltip, Text, chakra, useToast } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { useLocale } from "../../../hooks/useLocale";
import useTokens from "../../../hooks/FeeDistributor/useTokens";
import useClaimableTokens from "../../../hooks/RewardGauge/useClaimableTokens";
import useMint from "../../../hooks/Minter/useMint";
import TxSentToast from "../../shared/TxSentToast";
import FeeReward from "./FeeReward";
import { etherAmountFormat } from "lib/utils";
import type { SafeComponentProps } from "lib/types";

export default function Reward({ account, safeAddress }: SafeComponentProps) {
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { readFn: feeTokens } = useTokens();
  const { prepareFn: claimableTokens } = useClaimableTokens({ account, safeAddress });
  const { writeFn, waitFn } = useMint({
    account,
    safeAddress,
    callbacks: {
      onSuccessWrite(data) {
        toast({
          title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
          status: "success",
          duration: 5000,
          render: (props) => <TxSentToast txid={data.hash} {...props} />,
        });
      },
      onErrorWrite(e) {
        toast({
          description: e.message,
          status: "error",
          duration: 5000,
        });
      },
      onSuccessConfirm(data) {
        toast({
          title: t("TRANSACTION_CONFIRMED"),
          status: "success",
          duration: 5000,
        });
      },
      onErrorConfirm(e) {
        toast({
          description: e.message,
          status: "error",
          duration: 5000,
        });
      },
    },
  });

  return (
    <>
      <HStack justifyContent={"space-between"} alignItems={"baseline"} mt={4}>
        <chakra.p color={"gray.400"}>
          {t("REWARDS")}
          <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>{t("REWARDS_HELP")}</Text>}>
            <QuestionIcon fontSize={"md"} mb={1} ml={1} />
          </Tooltip>
        </chakra.p>
        <VStack spacing={4} alignItems={"end"}>
          <HStack spacing={2}>
            <chakra.div fontSize={"2xl"}>
              {typeof claimableTokens.data === "undefined" && <Spinner />}
              {!!claimableTokens.data && typeof claimableTokens.data.result === "bigint" && (
                <>{etherAmountFormat(claimableTokens.data.result.toString(), 6)}</>
              )}
              <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
                YMWK
              </chakra.span>
            </chakra.div>
            <Button
              variant={"solid"}
              colorScheme="green"
              size={"sm"}
              isDisabled={!claimableTokens.data || !claimableTokens.data.result || !writeFn.write}
              isLoading={writeFn.isLoading || waitFn.isLoading}
              onClick={() => writeFn.write!()}
            >
              {t("CLAIM")}
            </Button>
          </HStack>
          {typeof feeTokens.data === "undefined" && <Spinner />}
          {!!feeTokens.data &&
            !!account &&
            feeTokens.data.map((token: `0x${string}`) => (
              <FeeReward
                key={token}
                account={account}
                safeAddress={safeAddress}
                tokenAddress={token}
              />
            ))}
        </VStack>
      </HStack>
    </>
  );
}
