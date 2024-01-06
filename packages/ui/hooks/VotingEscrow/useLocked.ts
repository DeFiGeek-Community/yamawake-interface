import { useContractRead } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";

export default function useLocked(address?: `0x${string}`): {
  readFn: ReturnType<typeof useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_VE_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
  };
  const readFn = useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>({
    ...config,
    functionName: "locked",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  return {
    readFn,
  };
}
