import { useEffect } from "react";
import { useNetwork, usePrepareContractWrite } from "wagmi";
import MinterABI from "lib/constants/abis/Minter.json";
import { useSafeContractWrite, useSafeWaitForTransaction } from "../Safe";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export type UseMintReturn = {
  prepareFn: ReturnType<typeof usePrepareContractWrite<typeof MinterABI, "mint", number>>;
  writeFn: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
};

export default function useMint({
  account,
  safeAddress,
  callbacks,
}: {
  account: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  callbacks?: {
    onSuccessWrite?: (data: any) => void;
    onErrorWrite?: (error: Error) => void;
    onSuccessConfirm?: (data: any) => void;
    onErrorConfirm?: (error: Error) => void;
  };
}): UseMintReturn {
  const { chain } = useNetwork();

  const config = {
    address: chain ? (CONTRACT_ADDRESSES[chain.id].MINTER as `0x${string}`) : "0x",
    abi: MinterABI,
    chainId: chain?.id,
  };

  const prepareFn = usePrepareContractWrite({
    ...config,
    functionName: "mint",
    account: safeAddress || account,
    args: [chain ? (CONTRACT_ADDRESSES[chain.id].REWARD_GAUGE as `0x${string}`) : "0x"],
    enabled: !!account && !!chain,
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
