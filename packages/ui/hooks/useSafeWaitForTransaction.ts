// Forked from https://github.com/moleculeprotocol/test-wagmi-safe-privy
import { useIsContractWallet } from "./useIsContractWallet";
import { resolveSafeTx } from "lib/utils/safe";
import { useEffect, useState } from "react";
import { useAccount, useAccount, useWaitForTransaction } from "wagmi";
import { WaitForTransactionArgs } from "wagmi/actions";

type UseSafeWaitForTransactionReturn = ReturnType<typeof useWaitForTransaction> & {
  isSafeWallet?: boolean;
  resolvedTxHash?: `0x${string}`;
  resolvingPromise?: Promise<void | `0x${string}` | undefined>;
};
export const useSafeWaitForTransaction = (
  config: Parameters<typeof useWaitForTransaction>[0],
): UseSafeWaitForTransactionReturn => {
  const { address } = useAccount();
  const { isSafe: isSafeWallet } = useIsContractWallet(address);
  const { chain } = useAccount();
  const [safeResult, setSafeResult] = useState<Partial<WaitForTransactionArgs>>();
  const waitResponse = useWaitForTransaction({ ...safeResult, enabled: !!safeResult?.hash });

  useEffect(() => {
    if (!config || !config.hash || !chain || isSafeWallet === undefined) {
      return;
    }

    if (isSafeWallet) {
      //try to resolve the underlying transaction
      resolveSafeTx(chain.id, config.hash).then((resolvedTx) => {
        if (!resolvedTx) throw new Error("couldnt resolve safe tx");
        setSafeResult({ ...config, hash: resolvedTx });
      });
    } else {
      setSafeResult(config);
    }
  }, [chain, isSafeWallet, config?.hash]);

  return { ...waitResponse, isSafeWallet, resolvedTxHash: safeResult?.hash };
};
