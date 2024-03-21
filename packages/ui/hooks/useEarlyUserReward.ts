import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import DistributorABI from "lib/constants/abis/Distributor.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useEarlyUserReward({
  address,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  address: `0x${string}`;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  readFn: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const { chain } = useNetwork();
  const config = {
    address: chain ? CONTRACT_ADDRESSES[chain.id].DISTRIBUTOR : "0x",
    abi: DistributorABI,
  };
  const readFn = useContractRead<typeof DistributorABI, "scores", bigint>({
    ...config,
    functionName: "scores",
    args: [address],
    watch: true,
    enabled: !!chain && !!address,
  });

  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "claim",
    args: [address],
    enabled: !!chain && !!address && !!readFn.data,
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
    readFn,
    writeFn,
    waitFn,
  };
}
