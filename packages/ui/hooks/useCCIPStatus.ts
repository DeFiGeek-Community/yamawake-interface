import { useEffect, useState } from "react";
import { createPublicClient, fallback, parseAbiItem } from "viem";
import { useContractRead } from "wagmi";
import { CHAIN_INFO } from "lib/constants/chains";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { getRPCEndpoints } from "lib/utils/chain";
import { CCIP_MESSAGE_STATES } from "lib/constants/ccip";
import RouterABI from "lib/constants/abis/Router.json";
import OfframpABI from "lib/constants/abis/Offramp.json";

export default function useCCIPStatus({
  sourceChainId,
  destinationChainId,
  messageId,
}: {
  sourceChainId: number;
  destinationChainId: number;
  messageId: string | null;
}): keyof typeof CCIP_MESSAGE_STATES | null {
  const [status, setStatus] = useState<keyof typeof CCIP_MESSAGE_STATES | null>(null);
  const destinationChain = CHAIN_INFO[destinationChainId];
  const destinationRpcEndpoints = getRPCEndpoints(destinationChainId);
  const destinationClient = createPublicClient({
    chain: destinationChain,
    transport: fallback(destinationRpcEndpoints),
  });

  // const sourceRouterAddress = CONTRACT_ADDRESSES[sourceChainId].ROUTER;
  const sourceChainSelector = CHAIN_INFO[sourceChainId].chainSelector;
  const destinationRouterAddress = CONTRACT_ADDRESSES[destinationChainId].ROUTER;
  // const destinationChainSelector = CHAIN_INFO[destinationChainId].chainSelector;

  // const sourceRouterContract = {
  //   address: sourceRouterAddress,
  //   abi: RouterABI,
  //   chainId: sourceChainId,
  // };

  // const isChainSupported = useContractRead({
  //   ...sourceRouterContract,
  //   functionName: "isChainSupported",
  //   args: [destinationChainSelector],
  // });

  const destinationRouterContract = {
    address: destinationRouterAddress,
    abi: RouterABI,
    chainId: destinationChainId,
  };

  const offRamps = useContractRead<typeof RouterABI, "getOffRamps", any[]>({
    ...destinationRouterContract,
    functionName: "getOffRamps",
    watch: status !== "SUCCESS",
  });

  const [matchingOffRamps, setMatchingOffRamps] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    if (offRamps.data) {
      setMatchingOffRamps(
        offRamps.data.filter((offRamp: any) => offRamp.sourceChainSelector === sourceChainSelector),
      );
    }
  }, [offRamps.data]);

  useEffect(() => {
    if (matchingOffRamps) {
      console.log("test: Execute!!");
      for (const matchingOffRamp of matchingOffRamps) {
        getLogs(matchingOffRamp);
      }
    }
  }, [matchingOffRamps]);

  const getLogs = async (matchingOffRamp: any) => {
    const offRampContract = {
      address: matchingOffRamp.offRamp,
      abi: OfframpABI,
      chainId: destinationChainId,
    };

    const eventAbi =
      "event ExecutionStateChanged(uint64 indexed sequenceNumber, bytes32 indexed messageId, uint8 state, bytes data)";
    const parsedEvent = parseAbiItem(eventAbi);
    const events = await destinationClient.getLogs({
      ...offRampContract,
      address: matchingOffRamp.offRamp,
      event: parsedEvent,
      args: { messageId: messageId as `0x${string}` },
      fromBlock: 0n,
      toBlock: "latest",
    });

    if (events.length > 0) {
      const state = events[0].args.state;
      if (typeof state === "undefined") throw Error("unknown state");
      setStatus(CCIP_MESSAGE_STATES[state] as keyof typeof CCIP_MESSAGE_STATES);
      console.log(
        `Status of message ${messageId} on offRamp ${matchingOffRamp.offRamp} is ${CCIP_MESSAGE_STATES[state]}\n`,
      );
    }
  };

  return status;
}
