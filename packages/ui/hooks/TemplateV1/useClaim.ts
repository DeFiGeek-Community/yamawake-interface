import { useNetwork, usePrepareContractWrite } from "wagmi";
import TemplateV1 from "lib/constants/abis/TemplateV1.json";
import { useSafeContractWrite } from "../Safe/useSafeContractWrite";
import { useSafeWaitForTransaction } from "../Safe/useSafeWaitForTransaction";

export default function useClaim({
  chainId,
  targetAddress,
  address,
  safeAddress,
  onSuccessWrite,
  onSuccessConfirm,
  claimed,
}: {
  chainId: number;
  targetAddress: `0x${string}` | null;
  address: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  onSuccessWrite?: (data: any) => void;
  onSuccessConfirm?: (data: any) => void;
  claimed: boolean;
}): {
  prepareFn: any;
  writeFn: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
} {
  const { chain: connectedChain } = useNetwork();
  const enabled: boolean =
    !!targetAddress && !!address && !!connectedChain && chainId === connectedChain?.id && !claimed;

  const prepareFn = usePrepareContractWrite({
    chainId: connectedChain?.id,
    address: targetAddress ? targetAddress : "0x00",
    account: safeAddress || address,
    abi: TemplateV1,
    functionName: "claim",
    args: [safeAddress || address, safeAddress || address], // Contributer, Reciepient
    enabled,
  });

  const writeFn = useSafeContractWrite({
    ...prepareFn.config,
    safeAddress,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    chainId: connectedChain?.id,
    hash: writeFn.data?.hash,
    safeAddress,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
  });

  return {
    prepareFn,
    writeFn,
    waitFn,
  };
}
