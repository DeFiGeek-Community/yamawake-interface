import { useContractRead, useNetwork } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

type UseLockedReturnType = {
  locked: ReturnType<typeof useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>>;
  totalSupply: ReturnType<typeof useContractRead<typeof VotingEscrowABI, "totalSupply", bigint>>;
  totalLockedYMWK: ReturnType<typeof useContractRead<typeof VotingEscrowABI, "supply", bigint>>;
};
export default function useLocked(address?: `0x${string}`, watch?: boolean): UseLockedReturnType {
  const { chain } = useNetwork();

  const config = {
    address: chain ? (CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW as `0x${string}`) : "0x",
    abi: VotingEscrowABI,
  };
  const locked = useContractRead<typeof VotingEscrowABI, "locked", [bigint, bigint]>({
    ...config,
    functionName: "locked",
    args: [address],
    enabled: !!address && !!chain,
    watch: !!watch,
  });

  const totalSupply = useContractRead<typeof VotingEscrowABI, "totalSupply", bigint>({
    ...config,
    functionName: "totalSupply",
    enabled: !!chain,
    watch: !!watch,
  });

  const totalLockedYMWK = useContractRead<typeof VotingEscrowABI, "supply", bigint>({
    ...config,
    functionName: "supply",
    enabled: !!chain,
    watch: !!watch,
  });

  return { locked, totalSupply, totalLockedYMWK };
}
