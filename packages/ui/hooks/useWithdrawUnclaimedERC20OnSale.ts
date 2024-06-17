import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Template from "lib/constants/abis/TemplateV1.json";

export default function useWithdrawUnclaimedERC20OnSale({
  targetAddress,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  targetAddress: `0x${string}` | null;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const { chain } = useAccount();
  const enabled: boolean = !!targetAddress && !!chain;

  const prepareFn = usePrepareContractWrite({
    chainId: chain?.id,
    address: targetAddress || "0x00",
    abi: Template,
    functionName: "withdrawUnclaimedERC20OnSale",
    enabled,
  });

  const writeFn = useContractWrite({
    ...prepareFn.config,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    chainId: chain?.id,
    hash: writeFn.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    prepareFn,
    writeFn,
    waitFn,
  };
}
