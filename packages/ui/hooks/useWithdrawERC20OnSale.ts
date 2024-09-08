import { useNetwork, usePrepareContractWrite } from "wagmi";
import Template from "lib/constants/abis/TemplateV1.json";
import { useSafeContractWrite } from "./Safe/useSafeContractWrite";
import { useSafeWaitForTransaction } from "./Safe/useSafeWaitForTransaction";

export default function useWithdrawERC20OnSale({
  targetAddress,
  account,
  safeAddress,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
  isReady = true,
}: {
  targetAddress: `0x${string}` | null;
  account: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
  isReady?: boolean;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
} {
  const { chain } = useNetwork();
  const enabled: boolean = isReady && !!targetAddress && !!chain;

  const prepareFn = usePrepareContractWrite({
    chainId: chain?.id,
    address: targetAddress ? targetAddress : "0x00",
    account: safeAddress || account,
    abi: Template,
    functionName: "withdrawERC20Onsale",
    enabled,
  });

  const writeFn = useSafeContractWrite({
    ...prepareFn.config,
    safeAddress,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    chainId: chain?.id,
    hash: writeFn.data?.hash,
    safeAddress,
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
