import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Template from "lib/constants/abis/TemplateV1.json";

export default function useWithdrawERC20OnSale({
  targetAddress,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
  isReady = true,
}: {
  targetAddress: `0x${string}` | null;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
  isReady?: boolean;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const { chain } = useAccount();
  const enabled: boolean = isReady && !!targetAddress && !!chain;

  const prepareFn = usePrepareContractWrite({
    chainId: chain?.id,
    address: targetAddress ? targetAddress : "0x00",
    abi: Template,
    functionName: "withdrawERC20Onsale",
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
