import { mainnet, sepolia, holesky, arbitrum, hardhat, base, baseSepolia } from "viem/chains";

export const CHAINLINK_PRICE_FEED: { [key: string]: { [key: number]: `0x${string}` } } = {
  "ETH-USD": {
    [mainnet.id]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    [arbitrum.id]: "0x",
    [sepolia.id]: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    [base.id]: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    [baseSepolia.id]: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    [holesky.id]: "0x",
    [hardhat.id]: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};
