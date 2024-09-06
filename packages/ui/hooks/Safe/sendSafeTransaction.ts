// Forked from wagmi
// https://github.com/wevm/wagmi/blob/1.x/packages/core/src/actions/transactions/sendTransaction.ts
import {
  getAddress,
  type Account,
  type Address,
  type Chain,
  type SendTransactionParameters,
  type SendTransactionReturnType,
} from "viem";

import Safe, { SafeTransactionOptionalProps } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import {
  ConnectorNotFoundError,
  getConfig,
  getWalletClient,
  prepareSendTransaction,
} from "@wagmi/core";
import { assertActiveChain } from "./utils";

export type SendTransactionArgs = {
  /** Chain ID used to validate if the walletClient is connected to the target chain */
  chainId?: number;
  mode?: "prepared";
  to: string;
} & Omit<SendTransactionParameters<Chain, Account>, "chain" | "to">;

export type SendTransactionResult = {
  hash: SendTransactionReturnType;
};

/**
 * @description Function to send a transaction.
 *
 * It is recommended to pair this with the `prepareSendTransaction` function to avoid
 * [UX pitfalls](https://wagmi.sh/react/prepare-hooks#ux-pitfalls-without-prepare-hooks).
 *
 * @example
 * import { prepareSendTransaction, sendTransaction } from '@wagmi/core'
 *
 * const config = await prepareSendTransaction({
 *  to: 'moxey.eth',
 *  value: parseEther('1'),
 * })
 * const result = await sendTransaction(config)
 */
export async function sendSafeTransaction({
  accessList,
  account,
  chainId,
  data,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  mode,
  nonce,
  to,
  value,
  safeAddress,
}: SendTransactionArgs & { safeAddress: `0x${string}` }): Promise<SendTransactionResult> {
  /********************************************************************/
  /** START: iOS App Link cautious code.                              */
  /** Do not perform any async operations in this block.              */
  /** Ref: wagmi.sh/react/prepare-hooks#ios-app-link-constraints */
  /********************************************************************/

  // `getWalletClient` isn't really "asynchronous" as we have already
  // initialized the Wallet Client upon user connection, so it will return
  // immediately.
  const walletClient = await getWalletClient({ chainId });
  const connectorConfig = getConfig();
  if (!walletClient || !connectorConfig.connector) throw new ConnectorNotFoundError();

  if (chainId) assertActiveChain({ chainId });

  let args: SendTransactionParameters<Chain, Account>;
  if (mode === "prepared") {
    // @ts-ignore
    args = {
      account,
      accessList,
      chain: null,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: to as Address,
      value,
    };
  } else {
    // @ts-ignore
    args = await prepareSendTransaction({
      accessList,
      account,
      chainId,
      data,
      gas: gas || null,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    });
  }

  const provider = await connectorConfig.connector.getProvider();
  if (!provider) throw new Error("Provider is not set");
  if (!args.account) throw new Error("account is not set");

  const signer = walletClient.account.address;

  let protocolKit = await Safe.init({
    provider,
    signer,
    safeAddress,
  });

  const transactions = [
    {
      to: getAddress(to),
      data: data ?? "0x",
      value: value?.toString() ?? "0",
      // operation, // Optional
    },
  ];
  const options: SafeTransactionOptionalProps = {
    // safeTxGas, // Optional
    // baseGas // Optional
    gasPrice: gasPrice ? gasPrice.toString() : undefined, // Optional
    // gasToken, // Optional
    // refundReceiver, // Optional
    nonce, // Optional
  };

  const safeTransaction = await protocolKit.createTransaction({ transactions, options });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signHash(safeTxHash);
  // Propose transaction to the service
  const apiKit = new SafeApiKit({
    chainId: BigInt(chainId ?? (await connectorConfig.connector.getChainId())),
  });
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signer,
    senderSignature: signature.data,
  });

  //   const hash = await walletClient.sendTransaction({
  //     ...args,
  //     chain: chainId ? ({ id: chainId } as Chain) : null,
  //   });

  /********************************************************************/
  /** END: iOS App Link cautious code.                                */
  /** Go nuts!                                                        */
  /********************************************************************/

  return { hash: safeTxHash as `0x${string}` };
}
