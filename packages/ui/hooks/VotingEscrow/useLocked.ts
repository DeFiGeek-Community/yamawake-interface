import { useContractRead, useNetwork } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useLocked(
  address?: `0x${string}`,
  watch?: boolean,
): ReturnType<typeof useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>> {
  const { chain } = useNetwork();

  const config = {
    address: chain ? (CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW as `0x${string}`) : "0x",
    abi: VotingEscrowABI,
  };
  const readFn = useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>({
    ...config,
    functionName: "locked",
    args: [address],
    enabled: !!address && !!chain,
    watch: !!watch,
  });

  return readFn;
}
