import { useContractRead, useNetwork } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useBalanceOf(
  address?: `0x${string}`,
  watch?: boolean,
): ReturnType<typeof useContractRead<typeof VotingEscrowABI, "balanceOf", bigint>> {
  const { chain } = useNetwork();

  const config = {
    address: chain ? CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW : "0x",
    abi: VotingEscrowABI,
  };
  console.log(config, address);
  const readFn = useContractRead<typeof VotingEscrowABI, "balanceOf", bigint>({
    ...config,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address && !!chain,
    watch: !!watch,
  });

  return readFn;
}
