import { mainnet, sepolia, holesky, arbitrum, hardhat } from "viem/chains";

type ContractAddresses = {
  [key: number]: { readonly [key: string]: `0x${string}` };
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  [mainnet.id]: {
    FACTORY: "0x3Ee0952314739e2c4270F0ecE989cf73F5891243",
    DISTRIBUTOR: "0xA90a01242c2966eE761C130A260Ceb9D9A793b5F",
    YMWK: "0x15Dac05C93e1c5F31a29547340997BA9f6ec4F87",
  },
  [arbitrum.id]: {
    FACTORY: "0x",
    DISTRIBUTOR: "0x",
    YMWK: "0x",
  },
  [sepolia.id]: {
    FACTORY: "0x92B9B6384d295f22fdBc8Eb661D7D574B96D2E93",
    DISTRIBUTOR: "0x0cD7A866e06451Dde4057e96F75915511AB41733",
    YMWK: "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C",
  },
  [holesky.id]: {
    FACTORY: "0x0d72Cd6C887A9413D00cB4527A56d6D25fEc27B3",
    DISTRIBUTOR: "0x235a85001086F72158179bB0e785D4d7adadDaDE",
    YMWK: "0x059EDE6E6A81e52b3630Ac5cA37E5d46c62a4494",
  },

  [hardhat.id]: {
    FACTORY: process.env.NEXT_PUBLIC_LOCAL_FACTORY_ADDRESS as `0x${string}`,
    DISTRIBUTOR: process.env.NEXT_PUBLIC_LOCAL_DISTRIBUTOR_ADDRESS as `0x${string}`,
    YMWK: process.env.NEXT_PUBLIC_LOCAL_YMWK_ADDRESS as `0x${string}`,
  },
};
