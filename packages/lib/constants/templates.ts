import { mainnet, sepolia, holesky, arbitrum, hardhat } from "viem/chains";

type CompatibleTemplates = {
  readonly [key: number]: [string];
};

export const TEMPLATE_V1_NAME =
  "0x54656d706c617465563100000000000000000000000000000000000000000000";

export const COMPATIBLE_TEMPLATES: CompatibleTemplates = {
  [mainnet.id]: [TEMPLATE_V1_NAME],
  [arbitrum.id]: [TEMPLATE_V1_NAME],
  [sepolia.id]: [TEMPLATE_V1_NAME],
  [holesky.id]: [TEMPLATE_V1_NAME],
  [hardhat.id]: [TEMPLATE_V1_NAME],
};
