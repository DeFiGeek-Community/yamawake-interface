import { mainnet, sepolia, arbitrum, hardhat } from "viem/chains";

export const CHAINLINK_PRICE_FEED: { [key: string]: { [key: number]: `0x${string}` } } = {
  "ETH-USD": {
    [mainnet.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    [arbitrum.id]: "0x",
    [sepolia.id]: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    [hardhat.id]: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};
