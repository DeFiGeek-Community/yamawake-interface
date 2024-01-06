import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import MinterABI from "lib/constants/abis/Minter.json";

export default function useMint({
  address,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  address?: `0x${string}`;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_MIINTER_ADDRESS as `0x${string}`,
    abi: MinterABI,
  };
  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "mint",
    args: [address],
    enabled: !!address,
  });

  const writeFn = useContractWrite({
    ...claimConfig,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    hash: writeFn.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    writeFn,
    waitFn,
  };
}
