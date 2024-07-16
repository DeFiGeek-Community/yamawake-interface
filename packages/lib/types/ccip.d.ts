export type FeeToken = {
  symbol: string;
  address: `0x${string}`;
};

export type EVMTokenAmount = {
  token: string;
  amount: bigint;
};

export type CCIPSendRequestedEventArgs = {
  sourceChainSelector: bigint;
  sender: string;
  receiver: string;
  sequenceNumber: bigint;
  gasLimit: bigint;
  strict: boolean;
  nonce: bigint;
  feeToken: string;
  feeTokenAmount: bigint;
  data: string;
  tokenAmounts: EVMTokenAmount[];
  sourceTokenData: string[];
  messageId: string;
};

export type DecodedLog<T> = {
  eventName: string;
  args: T;
};
