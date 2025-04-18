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
    // V1.5 Contracts -->
    MINTER: "0x5D0dA8882f95dC27EBa915F3ea266Bcc3D6bAdE4",
    VOTING_ESCROW: "0x168c2F7D4924bd6e4282F7eDBb0cFDcca1c7d113",
    REWARD_GAUGE: "0x772b86f1AfA923908BA8e8F27e8aCBA6A01b1118",
    FEE_DISTRIBUTOR: "0x0d99BfC6367AdD8b199fA530168dcd893317A0c9",
    // <--
    FACTORY: "0x3Ee0952314739e2c4270F0ecE989cf73F5891243",
    // Receiver
    DISTRIBUTOR: "0x3D095553fE2A3b138B31f9d47a26e2aDf340c6a5",
    YMWK: "0x15Dac05C93e1c5F31a29547340997BA9f6ec4F87",
    ROUTER: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [sepolia.id]: {
    // V1.5 Contracts -->
    MINTER: "0xFFaB22833669341D22c093dbF58F06Fd2bc00cC2",
    VOTING_ESCROW: "0x4c83C788fe66b4c848e381f2894C1B62B411a1F2",
    REWARD_GAUGE: "0xA3D046388C4bfc004F16734e2B80218Eb0E588c9",
    FEE_DISTRIBUTOR: "0x3531529D473fF36dD0f784a0f2B02ea0917019F8",
    // <--
    FACTORY: "0x92B9B6384d295f22fdBc8Eb661D7D574B96D2E93",
    // Receiver
    DISTRIBUTOR: "0xfd29B29e26678B29Be02C82161490E9a3Ed5971d",
    YMWK: "0x5055d837992bE5e1fE193F180B22B232099017d8",
    ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    WETH: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534",
  },
  [arbitrum.id]: {
    // V1.5 Contracts -->
    MINTER: "0x",
    VOTING_ESCROW: "0x",
    REWARD_GAUGE: "0x",
    FEE_DISTRIBUTOR: "0x",
    // <--
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  [arbitrumSepolia.id]: {
    // V1.5 Contracts -->
    MINTER: "0x",
    VOTING_ESCROW: "0x",
    REWARD_GAUGE: "0x",
    FEE_DISTRIBUTOR: "0x",
    // <--
    FACTORY: "0x",
    // Sender
    DISTRIBUTOR: "0x",
    YMWK: "0x",
    ROUTER: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    LINK: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    WETH: "0xE591bf0A0CF924A0674d7792db046B23CEbF5f34",
  },
  [base.id]: {
    // V1.5 Contracts -->
    MINTER: "0x",
    VOTING_ESCROW: "0x",
    REWARD_GAUGE: "0x",
    FEE_DISTRIBUTOR: "0x",
    // <--
    FACTORY: "0x7D8B9EbFC8BB3D42099Cd8cD86B4376e49dF3275",
    // Sender
    DISTRIBUTOR: "0x1cfa5641c01406aB8AC350dEd7d735ec41298372",
    YMWK: "0x",
    ROUTER: "0x881e3A65B4d4a04dD529061dd0071cf975F58bCD",
    LINK: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  [baseSepolia.id]: {
    // V1.5 Contracts -->
    MINTER: "0x",
    VOTING_ESCROW: "0x",
    REWARD_GAUGE: "0x",
    FEE_DISTRIBUTOR: "0x",
    // <--
    FACTORY: "0xC338A5ed49b61759921fe08eaf4E56C921b0b599",
    // Sender
    DISTRIBUTOR: "0x03A1eaD2f81Df2b48Ce1b8778eCDaF85dcD4FBe3",
    YMWK: "0x",
    ROUTER: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    LINK: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  [hardhat.id]: {
    // V1.5 Contracts -->
    MINTER: "0x",
    VOTING_ESCROW: "0x",
    REWARD_GAUGE: "0x",
    FEE_DISTRIBUTOR: "0x",
    // <--
    FACTORY: process.env.NEXT_PUBLIC_LOCAL_FACTORY_ADDRESS as `0x${string}`,
    DISTRIBUTOR: process.env.NEXT_PUBLIC_LOCAL_DISTRIBUTOR_ADDRESS as `0x${string}`,
    YMWK: process.env.NEXT_PUBLIC_LOCAL_YMWK_ADDRESS as `0x${string}`,
    ROUTER: process.env.NEXT_PUBLIC_LOCAL_ROUTER_ADDRESS as `0x${string}`,
    LINK: process.env.NEXT_PUBLIC_LOCAL_LINK_ADDRESS as `0x${string}`,
    WETH: process.env.NEXT_PUBLIC_LOCAL_WETH_ADDRESS as `0x${string}`,
  },
};
