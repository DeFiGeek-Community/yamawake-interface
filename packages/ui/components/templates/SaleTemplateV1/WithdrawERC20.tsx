import { QuestionIcon } from "@chakra-ui/icons";
import {
  chakra,
  useToast,
  Button,
  Tooltip,
  Flex,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useContractRead, erc20ABI } from "wagmi";
import useWithdrawERC20Onsale from "../../../hooks/useWithdrawERC20Onsale";
import { Sale } from "lib/types/Sale";
import { getDecimalsForView, tokenAmountFormat } from "lib/utils";
import { getBigNumber } from "lib/utils/bignumber";
import TxSentToast from "../../TxSentToast";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  sale: Sale;
  onSuccessConfirm?: (data: any) => void;
};
export default function WithdrawERC20({ sale, onSuccessConfirm }: Props) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { data: balance } = useContractRead({
    address: sale.token as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [sale.id as `0x${string}`],
    watch: true,
  });
  const {
    prepareFn: withdrawERC20PrepareFn,
    writeFn: withdrawERC20WriteFn,
    waitFn: withdrawERC20WaitFn,
  } = useWithdrawERC20Onsale({
    targetAddress: sale.id as `0x${string}`,
    onSuccessWrite: (data) => {
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
    onSuccessConfirm: (data) => {
      toast({
        description: `Transaction confirmed!`,
        status: "success",
        duration: 5000,
      });
      onSuccessConfirm && onSuccessConfirm(data);
    },
    isReady: balance && !balance.isZero(),
  });
  const { t } = useLocale();

  return (
    <Box>
      <Heading fontSize={"lg"} textAlign={"left"}>
        {t("TOKEN_BALANCE_IN_SALE_CONTRACT")}
        <Tooltip
          hasArrow
          label={t("TOKEN_WITHDRAWALS_WILL_BE_AVAILABLE_IMMEDIATELY_AFTER_THE_END_OF_THE_SALE")}
        >
          <QuestionIcon mb={1} ml={1} />
        </Tooltip>
      </Heading>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <chakra.p fontSize={"lg"}>
          {typeof balance !== "undefined"
            ? tokenAmountFormat(
                getBigNumber(balance.toString()),
                sale.tokenDecimals,
                getDecimalsForView(
                  getBigNumber(sale.allocatedAmount),
                  sale.tokenDecimals
                )
              )
            : "-"}{" "}
          {sale.tokenSymbol}
        </chakra.p>
        <Button
          variant={"solid"}
          isDisabled={
            !balance || balance.isZero() || !withdrawERC20WriteFn.writeAsync
          }
          isLoading={
            withdrawERC20WriteFn.isLoading || withdrawERC20WaitFn.isLoading
          }
          onClick={() => withdrawERC20WriteFn.writeAsync()}
        >
          {t("WITHDRAW_TOKEN")}
        </Button>
      </Flex>
    </Box>
  );
}
