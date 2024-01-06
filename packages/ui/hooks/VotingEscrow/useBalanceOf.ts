import { useContractRead } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";

export default function useBalanceOf(address?: `0x${string}`): {
  readFn: ReturnType<typeof useContractRead<typeof VotingEscrowABI, "balanceOf", bigint>>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_VE_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
  };
  const readFn = useContractRead<typeof VotingEscrowABI, "balanceOf", bigint>({
    ...config,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  console.log(!!address);

  return {
    readFn,
  };
}
