export type User = {
  address: `0x${string}`;
  chainId: number;
  safeAccount: `0x${string}` | undefined;
};

export type SignInParams = {
  title: string;
  targetAddress: `0x${string}`;
  chainId: number;
  safeAddress?: `0x${string}`;
};
