import { mainnet, sepolia, arbitrum, hardhat } from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    FACTORY: "0x3Ee0952314739e2c4270F0ecE989cf73F5891243",
    DISTRIBUTOR: "0xA90a01242c2966eE761C130A260Ceb9D9A793b5F",
    YMWK: "0x15Dac05C93e1c5F31a29547340997BA9f6ec4F87",
  },
  [sepolia.id]: {
    FACTORY: "0x92B9B6384d295f22fdBc8Eb661D7D574B96D2E93",
    DISTRIBUTOR: "0x5846980E13B4F74F61A76877BD40102aBcF22EaF",
    YMWK: "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C",
  },
};
