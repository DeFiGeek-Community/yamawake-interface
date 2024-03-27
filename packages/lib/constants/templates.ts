import { mainnet, sepolia, arbitrum, hardhat } from "viem/chains";

type CompatibleTemplates = {
  readonly [key: number]: [string];
};

export const TEMPLATE_V1_NAME =
  "0x54656d706c617465563100000000000000000000000000000000000000000000";

export const COMPATIBLE_TEMPLATES: CompatibleTemplates = {
  [mainnet.id]: [TEMPLATE_V1_NAME],
  [arbitrum.id]: [TEMPLATE_V1_NAME],
  [sepolia.id]: [TEMPLATE_V1_NAME],
  [hardhat.id]: [TEMPLATE_V1_NAME],
};

export const LOCK_DURATION: { [key: string]: number } = {
  // TemplateV1 -> 3 day
  [TEMPLATE_V1_NAME]: 86400 * 3,
};

export const FEE_RATE_PER_MIL: { [key: string]: number } = {
  // TemplateV1
  [TEMPLATE_V1_NAME]: 1,
};
