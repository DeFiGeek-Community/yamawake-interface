import { InfoIcon, QuestionIcon } from "@chakra-ui/icons";
import { useToast, Box, Heading, chakra, Button, Tooltip, Flex } from "@chakra-ui/react";
import { useBalance, useNetwork } from "wagmi";
import useWithdrawRaisedETH from "../../../hooks/useWithdrawRaisedETH";
import { TemplateV1 } from "lib/types/Auction";
import { tokenAmountFormat } from "lib/utils";
import { getBigNumber } from "lib/utils/bignumber";
import TxSentToast from "../../shared/TxSentToast";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  chainId: number;
  auction: TemplateV1;
  account: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
  onSuccessConfirm?: (data: any) => void;
};
export default function WithdrawRaisedETH({
  chainId,
  auction,
  account,
  safeAddress,
  onSuccessConfirm,
}: Props) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();
  const { chain: connectedChain } = useNetwork();
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address: auction.id as `0x${string}`,
  });
  const {
    prepareFn: withdrawETHPrepareFn,
    writeFn: withdrawETHWriteFn,
    waitFn: withdrawETHWaitFn,
  } = useWithdrawRaisedETH({
    targetAddress: auction.id as `0x${string}`,
    account,
    safeAddress,
    onSuccessWrite: (data) => {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 10000,
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
    onSuccessConfirm: (data) => {
      toast({
        description: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
      onSuccessConfirm && onSuccessConfirm(data);
    },
    isReady:
      auction.closingAt < new Date().getTime() / 1000 &&
      !!balanceData &&
      balanceData.value !== BigInt(0) &&
      chainId === connectedChain?.id,
  });

  return (
    <Box>
      <Heading fontSize={"lg"} textAlign={"left"}>
        {t("TOTAL_RAISED_BALANCE_IN_SALE_CONTRACT")}
        <Tooltip hasArrow label={t("AFTER_THE_SALE_CLOSES")}>
          <QuestionIcon mb={1} ml={1} />
        </Tooltip>
      </Heading>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <chakra.p fontSize={"lg"}>
          {typeof balanceData !== "undefined"
            ? tokenAmountFormat(getBigNumber(balanceData.value.toString()), 18, 3)
            : "-"}{" "}
          ETH
        </chakra.p>
        <Button
          variant={"solid"}
          isDisabled={
            chainId !== connectedChain?.id ||
            connectedChain?.unsupported ||
            !balanceData ||
            balanceData.value === BigInt(0) ||
            !withdrawETHWriteFn.write
          }
          isLoading={
            withdrawETHWriteFn.isLoading ||
            withdrawETHWaitFn.isLoading ||
            (withdrawETHWriteFn.isSuccess && withdrawETHWaitFn.isIdle)
          }
          onClick={withdrawETHWriteFn.write}
        >
          {t("WITHDRAW_THE_TOTAL_RAISED")}
        </Button>
      </Flex>
      <chakra.p textAlign={"left"} fontSize={"sm"} color={"gray.400"}>
        <InfoIcon /> {t("ONE_PERCENT_FEE_WILL_BE_SUBTRACTED")}
      </chakra.p>
    </Box>
  );
}
