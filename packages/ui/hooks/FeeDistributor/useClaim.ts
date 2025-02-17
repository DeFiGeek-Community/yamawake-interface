import { useEffect } from "react";
import { useNetwork, usePrepareContractWrite } from "wagmi";
import FeeDistributorABI from "lib/constants/abis/FeeDistributor.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { useSafeContractWrite, useSafeWaitForTransaction } from "../Safe";

export type UseClaimReturn = {
  prepareFn: ReturnType<typeof usePrepareContractWrite<typeof FeeDistributorABI, "claim", number>>;
  writeFn: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
};

export default function useClaim({
  account,
  safeAddress,
  tokenAddress,
  callbacks,
}: {
  account: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  tokenAddress?: `0x${string}`;
  callbacks?: {
    onSuccessWrite?: (data: any) => void;
    onErrorWrite?: (error: Error) => void;
    onSuccessConfirm?: (data: any) => void;
    onErrorConfirm?: (error: Error) => void;
  };
}): UseClaimReturn {
  const { chain } = useNetwork();

  const config = {
    address: chain ? (CONTRACT_ADDRESSES[chain.id].FEE_DISTRIBUTOR as `0x${string}`) : "0x",
    abi: FeeDistributorABI,
    chainId: chain?.id,
  };

  const prepareFn = usePrepareContractWrite({
    ...config,
    functionName: "claim",
    account: safeAddress || account,
    args: [safeAddress || account, tokenAddress],
    enabled: !!account && !!tokenAddress && !!chain,
  });

  const writeFn = useSafeContractWrite({
    ...prepareFn.config,
    safeAddress,
    onSuccess(data) {
      callbacks?.onSuccessWrite && callbacks.onSuccessWrite(data);
    },
    onError(e: Error) {
      callbacks?.onErrorWrite && callbacks.onErrorWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    chainId: chain?.id,
    hash: writeFn.data?.hash,
    safeAddress,
    onSuccess(data) {
      callbacks?.onSuccessConfirm && callbacks?.onSuccessConfirm(data);
    },
    onError(e: Error) {
      callbacks?.onErrorConfirm && callbacks?.onErrorConfirm(e);
    },
  });

  useEffect(() => {
    if (waitFn.isSuccess) {
      callbacks?.onSuccessConfirm?.(waitFn.data);
    } else if (waitFn.isError) {
      callbacks?.onErrorConfirm?.(waitFn.error as Error);
    }
  }, [waitFn.isSuccess, waitFn.isError]);

  return {
    prepareFn,
    writeFn,
    waitFn,
  };
}
