export type User = {
  address: `0x${string}`;
  chainId: number;
};

export type SignInParams = {
  title: string;
  targetAddress: `0x${string}`;
  chainId: number;
};
