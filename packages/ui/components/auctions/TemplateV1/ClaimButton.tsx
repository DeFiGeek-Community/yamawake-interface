import { useState } from "react";
import { useNetwork } from "wagmi";
import { ButtonProps, Button, useToast } from "@chakra-ui/react";
import { TemplateV1 } from "lib/types/Auction";
import { getExpectedAmount } from "lib/utils";
import Big from "lib/utils/bignumber";
import useClaim from "../../../hooks/TemplateV1/useClaim";
import TxSentToast from "../../shared/TxSentToast";
import { useLocale } from "../../../hooks/useLocale";
import { KeyedMutator } from "swr";

interface Props {
  chainId: number;
  auction: TemplateV1;
  address: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
  myContribution: Big;
  isClaimed: boolean;
  mutateIsClaimed: KeyedMutator<any>;
}
export default function ClaimButton({
  chainId,
  auction,
  address,
  safeAddress,
  myContribution,
  isClaimed,
  mutateIsClaimed,
  ...buttonProps
}: Props & ButtonProps) {
  // Local state to change the claim button state after claim
  const [claimSucceeded, setClaimSucceeded] = useState<boolean>(false);
  // Local state to show that it is waiting for updateed subgraph data after the claim tx is confirmed
  const [waitForSubgraphUpdate, setWaitForSubgraphUpdate] = useState<boolean>(false);
  const { chain: connectedChain } = useNetwork();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();

  const {
    prepareFn: claimPrepareFn,
    writeFn: claimWriteFn,
    waitFn: claimWaitFn,
  } = useClaim({
    chainId,
    targetAddress: auction.id as `0x${string}`,
    address,
    safeAddress,
    onSuccessWrite: (data) => {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 10000,
        render: safeAddress ? undefined : (props) => <TxSentToast txid={data?.hash} {...props} />,
      });
    },
    onSuccessConfirm: (data) => {
      toast({
        title: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
      setClaimSucceeded(true);
      setWaitForSubgraphUpdate(true);
      // Wait for 5 sec to make sure that the subgraph data is updated
      setTimeout(() => {
        mutateIsClaimed();
        setWaitForSubgraphUpdate(false);
      }, 5000);
    },
    onErrorWrite: (e) => {
      toast({
        title: e.message || e.toString(),
        status: "error",
        duration: 5000,
      });
    },
    claimed: isClaimed,
  });
  const expectedAmount = getExpectedAmount(
    myContribution,
    Big(0),
    auction.totalRaised[0].amount,
    auction.allocatedAmount,
  );

  return (
    <Button
      variant={"solid"}
      isDisabled={
        connectedChain?.id !== chainId ||
        connectedChain?.unsupported ||
        isClaimed ||
        claimSucceeded ||
        !claimWriteFn.write
      }
      isLoading={
        claimWriteFn?.isLoading ||
        claimWaitFn?.isLoading ||
        waitForSubgraphUpdate ||
        (claimWriteFn.isSuccess && claimWaitFn.isIdle)
      }
      onClick={() => {
        claimWriteFn.write!();
      }}
      {...buttonProps}
    >
      {isClaimed || claimSucceeded
        ? t("CLAIMED")
        : auction.isFailed()
          ? t("CLAIM_REFUND")
          : t("CLAIM")}
    </Button>
  );
}
