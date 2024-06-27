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
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [sepolia.id]: {
    FACTORY: "0x92B9B6384d295f22fdBc8Eb661D7D574B96D2E93",
    // Receiver
    DISTRIBUTOR: "0x5846980E13B4F74F61A76877BD40102aBcF22EaF",
    YMWK: "0xdE2832DE0b4C0b4b6742e60186E290622B2B766C",
    ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    WETH: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534",
  },
  [arbitrum.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  [arbitrumSepolia.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    LINK: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    WETH: "0xE591bf0A0CF924A0674d7792db046B23CEbF5f34",
  },
  [base.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x881e3A65B4d4a04dD529061dd0071cf975F58bCD",
    LINK: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  [baseSepolia.id]: {
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    LINK: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  [hardhat.id]: {
    FACTORY: process.env.NEXT_PUBLIC_LOCAL_FACTORY_ADDRESS as `0x${string}`,
    DISTRIBUTOR: process.env.NEXT_PUBLIC_LOCAL_DISTRIBUTOR_ADDRESS as `0x${string}`,
    YMWK: process.env.NEXT_PUBLIC_LOCAL_YMWK_ADDRESS as `0x${string}`,
    ROUTER: process.env.NEXT_PUBLIC_LOCAL_ROUTER_ADDRESS as `0x${string}`,
    LINK: process.env.NEXT_PUBLIC_LOCAL_LINK_ADDRESS as `0x${string}`,
    WETH: process.env.NEXT_PUBLIC_LOCAL_WETH_ADDRESS as `0x${string}`,
  },
};
