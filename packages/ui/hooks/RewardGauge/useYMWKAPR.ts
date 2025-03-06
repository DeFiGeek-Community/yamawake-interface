import { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import YMWKABI from "lib/constants/abis/YMWK.json";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useYMWKAPR(): {
  aprStr: string;
} {
  const { chain } = useNetwork();
  const [formattedAPR, setFormattedAPR] = useState<string>("-%");

  const { data: rate } = useContractRead<typeof YMWKABI, "rate", bigint>({
    address: chain ? CONTRACT_ADDRESSES[chain.id].YMWK : "0x",
    abi: YMWKABI,
    enabled: !!chain,
    functionName: "rate",
  });

  const { data: totalSupply } = useContractRead<typeof VotingEscrowABI, "totalSupply", bigint>({
    address: chain ? CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW : "0x",
    abi: VotingEscrowABI,
    enabled: !!chain,
    functionName: "totalSupply",
    watch: true,
  });

  const yearInSeconds = 60n * 60n * 24n * 365n;

  useEffect(() => {
    if (!rate || !totalSupply) return;
    setFormattedAPR(`${((Number(rate * yearInSeconds) * 100) / Number(totalSupply)).toFixed(2)}%`);
  }, [rate, totalSupply]);

  return {
    aprStr: formattedAPR,
  };
}
