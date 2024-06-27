import {
  mainnet,
  sepolia,
  arbitrum,
  hardhat,
  arbitrumSepolia,
  base,
  baseSepolia,
} from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    FACTORY: "0x3Ee0952314739e2c4270F0ecE989cf73F5891243",
    // Receiver
    DISTRIBUTOR: "0xA90a01242c2966eE761C130A260Ceb9D9A793b5F",
    YMWK: "0x15Dac05C93e1c5F31a29547340997BA9f6ec4F87",
    ROUTER: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
  },
  [sepolia.id]: {
    FACTORY: "0x92B9B6384d295f22fdBc8Eb661D7D574B96D2E93",
    // Receiver
    DISTRIBUTOR: "0x5846980E13B4F74F61A76877BD40102aBcF22EaF",
    YMWK: "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C",
    ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  },
  [arbitrum.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
  },
  [arbitrumSepolia.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
  },
  [base.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x881e3A65B4d4a04dD529061dd0071cf975F58bCD",
  },
  [baseSepolia.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
  },
  [hardhat.id]: {
    FACTORY: process.env.NEXT_PUBLIC_LOCAL_FACTORY_ADDRESS as `0x${string}`,
    DISTRIBUTOR: process.env.NEXT_PUBLIC_LOCAL_DISTRIBUTOR_ADDRESS as `0x${string}`,
    YMWK: process.env.NEXT_PUBLIC_LOCAL_YMWK_ADDRESS as `0x${string}`,
    ROUTER: process.env.NEXT_PUBLIC_LOCAL_ROUTER_ADDRESS as `0x${string}`,
  },
};
