import { QuestionIcon } from "@chakra-ui/icons";
import { chakra, useToast, Button, Tooltip, Flex, Box, Heading } from "@chakra-ui/react";
import { useContractRead, erc20ABI, useNetwork } from "wagmi";
import useWithdrawERC20OnSale from "../../../hooks/useWithdrawERC20OnSale";
import { TemplateV1 } from "lib/types/Auction";
import { getDecimalsForView, tokenAmountFormat } from "lib/utils";
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
export default function WithdrawERC20({
  chainId,
  auction,
  account,
  safeAddress,
  onSuccessConfirm,
}: Props) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();
  const { chain: connectedChain } = useNetwork();
  const { data: balance } = useContractRead({
    address: auction.auctionToken.id as `0x${string}`,
    account: safeAddress || account,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [auction.id as `0x${string}`],
    watch: true,
  });
  const {
    prepareFn: withdrawERC20PrepareFn,
    writeFn: withdrawERC20WriteFn,
    waitFn: withdrawERC20WaitFn,
  } = useWithdrawERC20OnSale({
    targetAddress: auction.id as `0x${string}`,
    account,
    safeAddress,
    onSuccessWrite: (data: any) => {
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
    onSuccessConfirm: (data: any) => {
      toast({
        description: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
      onSuccessConfirm && onSuccessConfirm(data);
    },
    isReady:
      auction.closingAt < new Date().getTime() / 1000 &&
      typeof balance !== "undefined" &&
      balance !== 0n &&
      chainId === connectedChain?.id,
  });

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
                Number(auction.auctionToken.decimals),
                getDecimalsForView(
                  getBigNumber(auction.allocatedAmount),
                  Number(auction.auctionToken.decimals),
                ),
              )
            : "-"}{" "}
          {auction.auctionToken.symbol}
        </chakra.p>
        <Button
          variant={"solid"}
          isDisabled={
            chainId !== connectedChain?.id ||
            connectedChain?.unsupported ||
            !balance ||
            balance === 0n ||
            !withdrawERC20WriteFn.write
          }
          isLoading={withdrawERC20WriteFn.isLoading || withdrawERC20WaitFn.isLoading}
          onClick={withdrawERC20WriteFn.write}
        >
          {t("WITHDRAW_TOKEN")}
        </Button>
      </Flex>
    </Box>
  );
}
