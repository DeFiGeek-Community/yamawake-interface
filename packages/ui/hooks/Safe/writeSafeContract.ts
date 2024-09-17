// Forked from wagmi
// https://github.com/wevm/wagmi/blob/1.x/packages/core/src/actions/contracts/writeContract.ts
import type { Abi } from "abitype";
import {
  getAddress,
  encodeFunctionData,
  type Account,
  type Chain,
  type WriteContractParameters,
  type WriteContractReturnType,
} from "viem";
import type { PrepareWriteContractConfig } from "@wagmi/core";
import {
  ConnectorNotFoundError,
  getConfig,
  getWalletClient,
  prepareWriteContract,
} from "@wagmi/core";
import Safe, { SafeTransactionOptionalProps } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { assertActiveChain } from "./utils";

export type WriteContractMode = "prepared" | undefined;

export type WriteContractPreparedArgs<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TFunctionName extends string = string,
> = {
  /** Chain id. */
  chainId?: number;
  mode: "prepared";
  request: WriteContractParameters<TAbi, TFunctionName, Chain, Account>;
};

export type WriteContractUnpreparedArgs<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
> = Omit<WriteContractParameters<TAbi, TFunctionName, Chain, Account>, "chain"> & {
  /** Chain id. */
  chainId?: number;
  mode?: never;
};

export type WriteContractArgs<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
> =
  | WriteContractPreparedArgs<TAbi, TFunctionName>
  | WriteContractUnpreparedArgs<TAbi, TFunctionName>;

export type WriteContractResult = { hash: WriteContractReturnType };

/**
 * @description Function to call a contract write method.
 *
 * It is recommended to pair this with the {@link prepareWriteContract} function
 * to avoid [UX pitfalls](https://wagmi.sh/react/prepare-hooks#ux-pitfalls-without-prepare-hooks).
 *
 * @example
 * import { prepareWriteContract, writeContract } from '@wagmi/core'
 *
 * const config = await prepareWriteContract({
 *   address: '0x...',
 *   abi: wagmiAbi,
 *   functionName: 'mint',
 * })
 * const result = await writeContract(config)
 */
export async function writeSafeContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  config:
    | (WriteContractUnpreparedArgs<TAbi, TFunctionName> & { safeAddress: `0x${string}` })
    | (WriteContractPreparedArgs<TAbi, TFunctionName> & { safeAddress: `0x${string}` }),
): Promise<WriteContractResult> {
  const walletClient = await getWalletClient({ chainId: config.chainId });
  const connectorConfig = getConfig();
  if (!walletClient || !connectorConfig.connector) throw new ConnectorNotFoundError();
  if (config.chainId) assertActiveChain({ chainId: config.chainId });

  let request: WriteContractParameters<TAbi, TFunctionName, Chain, Account>;
  if (config.mode === "prepared") {
    request = config.request;
  } else {
    const { chainId: _, mode: __, ...args } = config;
    const res = await prepareWriteContract(args as PrepareWriteContractConfig);
    request = res.request as unknown as WriteContractParameters<
      TAbi,
      TFunctionName,
      Chain,
      Account
    >;
  }

  const provider = await connectorConfig.connector.getProvider();
  if (!provider) throw new Error("Provider is not set");
  if (!request.account) throw new Error("account is not set");

  const signer = walletClient.account.address;

  let protocolKit = await Safe.init({
    provider,
    // provider: "https://sepolia.infura.io/v3/2d24771d8ce44aaeb3706efa74f9693e",
    signer,
    safeAddress: config.safeAddress,
  });

  const data = encodeFunctionData({
    abi: request.abi as Abi,
    functionName: request.functionName.toString(),
    args: request.args ? [...request.args] : [],
  });
  const transactions = [
    {
      to: getAddress(request.address) as string,
      data: data,
      value: request.value?.toString() ?? "0",
      // operation, // Optional
    },
  ];
  const options: SafeTransactionOptionalProps = {
    // safeTxGas, // Optional
    // baseGas // Optional
    gasPrice: request.gasPrice ? request.gasPrice.toString() : undefined, // Optional
    // gasToken, // Optional
    // refundReceiver, // Optional
    nonce: request.nonce, // Optional
  };

  const safeTransaction = await protocolKit.createTransaction({ transactions, options });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signHash(safeTxHash);
  const chainId = await connectorConfig.connector.getChainId();
  // Propose transaction to the service
  const apiKit = new SafeApiKit({
    chainId: BigInt(chainId),
  });
  await apiKit.proposeTransaction({
    safeAddress: config.safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signer,
    senderSignature: signature.data,
  });
  // const txResponse = await protocolKit.executeTransaction(safeTransaction);

  return { hash: safeTxHash as `0x${string}` };
}
