import { QuestionIcon } from "@chakra-ui/icons";
import { useToast, Button, Tooltip, Flex, Box, Heading, chakra } from "@chakra-ui/react";
import { useContractRead, erc20ABI } from "wagmi";
import useWithdrawUnclaimedERC20OnAuction from "../../../hooks/useWithdrawUnclaimedERC20OnSale";
import { TemplateV1 } from "lib/types/Auction";
import { getDecimalsForView, tokenAmountFormat } from "lib/utils";
import { getBigNumber } from "lib/utils/bignumber";
import TxSentToast from "../../shared/TxSentToast";

type Props = {
  auction: TemplateV1;
  onSuccessConfirm?: (data: any) => void;
};
export default function WithdrawUnclaimedToken({ auction, onSuccessConfirm }: Props) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { data: balance } = useContractRead({
    address: auction.auctionToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [auction.id as `0x${string}`],
    watch: true,
  });
  const {
    prepareFn: withdrawUnclaimedERC20PrepareFn,
    writeFn: withdrawUnclaimedERC20WriteFn,
    waitFn: withdrawUnclaimedERC20WaitFn,
  } = useWithdrawUnclaimedERC20OnAuction({
    targetAddress: auction.id as `0x${string}`,
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
      onSuccessConfirm && onSuccessConfirm(data);
    },
  });

  return (
    <Box>
      <Heading fontSize={"lg"} textAlign={"left"}>
        Unclaimed token balance (削除予定)
        <Tooltip
          hasArrow
          label={"Finished, passed lock duration, and still there're unsold ERC-20."}
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
            !balance || balance === BigInt(0) || !withdrawUnclaimedERC20WriteFn.writeAsync
          }
          isLoading={
            withdrawUnclaimedERC20WriteFn.isLoading || withdrawUnclaimedERC20WaitFn.isLoading
          }
          onClick={() => withdrawUnclaimedERC20WriteFn.writeAsync()}
        >
          Withdraw Unclaimed Token
        </Button>
      </Flex>
    </Box>
  );
}
