import {
  usePrepareContractWrite,
  useContractWrite,
  erc20ABI,
  useContractRead,
  useToken,
} from "wagmi";
import { isAddress } from "viem";
import { AbiCoder, Interface } from "ethers";
import { useAtom } from "jotai";
import { useDebounce } from "use-debounce";
import { useFormik, FormikProps } from "formik";
import useApprove from "../useApprove";
import { useLocale } from "../useLocale";
import { AuctionForm } from "lib/types/Auction";
import Big, { multiply } from "lib/utils/bignumber";
import FactoryABI from "lib/constants/abis/Factory.json";
import { TEMPLATE_V1_NAME } from "lib/constants/templates";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { creatingAuctionAtom, waitingCreationTxAtom } from "lib/store";
import { useSafeContractWrite } from "../Safe/useSafeContractWrite";

const now = new Date().getTime();
export default function useAuctionForm({
  chainId,
  address,
  onSubmitSuccess,
  onSubmitError,
  onContractWriteSuccess,
  onContractWriteError,
  onApprovalTxSent,
  onApprovalTxConfirmed,
  safeAddress,
}: {
  chainId: number;
  address: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
  onSubmitSuccess?: (result: any) => void;
  onSubmitError?: (e: any) => void;
  onContractWriteSuccess?: (result: any) => void;
  onContractWriteError?: (e: any) => void;
  onApprovalTxSent?: (result: any) => void;
  onApprovalTxConfirmed?: (result: any) => void;
}): {
  formikProps: FormikProps<AuctionForm>;
  approvals: ReturnType<typeof useApprove>;
  prepareFn: any;
  writeFn: ReturnType<typeof useContractWrite>;
  tokenData: any;
  balance: bigint | undefined;
  debouncedAuction: AuctionForm;
  getEncodedArgs: () => string;
  getDecodedArgs: () => any;
  getTransactionRawData: (templateName: string, args: string) => string;
} {
  const [waitingTx, setWaitingTx] = useAtom(waitingCreationTxAtom);
  const [creatingAuction, setCreatingAuction] = useAtom(creatingAuctionAtom);
  const { t } = useLocale();
  const emptyAuction: AuctionForm = {
    templateName: TEMPLATE_V1_NAME,
    token: null,
    startingAt: now + 60 * 60 * 24 * 7 * 1000,
    eventDuration: 60 * 60 * 24 * 7,
    allocatedAmount: 1,
    minRaisedAmount: 0,
    owner: safeAddress || address,
  };

  const getEncodedArgs = (): string => {
    try {
      return AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "uint256", "address", "uint256", "uint256"],
        [
          debouncedAuction.owner,
          Math.round(debouncedAuction.startingAt / 1000),
          debouncedAuction.eventDuration,
          debouncedAuction.token,
          multiply(
            debouncedAuction.allocatedAmount,
            tokenData?.decimals ? Big(10).pow(tokenData.decimals) : 1,
          ).toString(),
          multiply(debouncedAuction.minRaisedAmount, Big(10).pow(18)).toString(),
        ],
      );
    } catch (e) {
      return "";
    }
  };

  const getDecodedArgs = () => {
    try {
      return AbiCoder.defaultAbiCoder().decode(
        ["address", "uint256", "uint256", "address", "uint256", "uint256"],
        getEncodedArgs(),
      );
    } catch (e) {
      return [];
    }
  };

  const getTransactionRawData = (templateName: string, args: string) => {
    const iface = new Interface(FactoryABI);
    return iface.encodeFunctionData("deployAuction", [templateName, args]);
  };

  const validate = (values: AuctionForm) => {
    const errors: any = {};

    if (!values.owner) {
      errors.owner = "Owner is required";
    }

    if (!values.templateName) {
      errors.templateName = "Template is required";
    }

    if (!values.token) {
      errors.token = "Token is required";
    } else if (!tokenData && tokenFetched) {
      errors.token = `Invalid token address`;
    }

    if (values.startingAt <= new Date().getTime()) {
      errors.startingAt = `Start date must be in the future`;
    }

    if (values.eventDuration < 60 * 60 * 24) {
      errors.eventDuration = `Auction duration must be more than or equal to 1 day`;
    }

    if (values.eventDuration > 60 * 60 * 24 * 30) {
      errors.eventDuration = `Auction duration must be less than or equal to 30 days`;
    }

    if (
      balance &&
      tokenData &&
      Big(balance.toString()).lt(
        Big(formikProps.values.allocatedAmount).mul(Big(10).pow(tokenData.decimals)),
      )
    ) {
      errors.allocatedAmount = `You need to have enough balance for allocation`;
    }

    if (
      tokenData &&
      !!multiply(formikProps.values.allocatedAmount, Big(10).pow(tokenData.decimals)).lt(
        Big(10).pow(6),
      )
    ) {
      errors.allocatedAmount = t("TOO_SMALL_ALLOCATION");
    }

    return errors;
  };

  const handleSubmit = async (auction: AuctionForm) => {
    try {
      const result = await writeFn!.writeAsync!();

      // Save minRaisedAmount to Atom to validate on the metadata form for convenience
      setCreatingAuction({ minRaisedAmount: debouncedAuction.minRaisedAmount });

      onSubmitSuccess && onSubmitSuccess(result);
    } catch (e: any) {
      onSubmitError && onSubmitError(e);
    }
  };

  const formikProps = useFormik<AuctionForm>({
    enableReinitialize: true,
    initialValues: Object.assign({}, emptyAuction),
    onSubmit: handleSubmit,
    validate,
  });

  const [debouncedAuction] = useDebounce(formikProps.values, 500);
  const { data: balance } = useContractRead({
    address: debouncedAuction.token as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [safeAddress || address],
    watch: true,
    enabled:
      (!!safeAddress || !!address) && !!debouncedAuction.token && isAddress(debouncedAuction.token),
  });

  const {
    data: tokenData,
    isLoading: tokenLoading,
    isFetched: tokenFetched,
  } = useToken({
    chainId,
    address: debouncedAuction.token as `0x${string}`,
    enabled: !!debouncedAuction.token && isAddress(debouncedAuction.token),
  });

  const prepareFn = usePrepareContractWrite({
    chainId,
    account: safeAddress || address,
    address: CONTRACT_ADDRESSES[chainId]?.FACTORY, //factory
    abi: FactoryABI,
    functionName: "deployAuction",
    args: [
      debouncedAuction.templateName, //TEMPLATE_V1_NAME
      getEncodedArgs(),
    ],
    enabled:
      (!!safeAddress || !!address) && !!debouncedAuction.token && isAddress(debouncedAuction.token),
  });

  const writeFn = useSafeContractWrite({
    ...prepareFn.config,
    safeAddress: safeAddress,
    // account: undefined,
    onSuccess(data) {
      // Save tx id to Atom to watch status from the form component
      setWaitingTx(data.hash);

      onContractWriteSuccess && onContractWriteSuccess(data);
    },
    onError(e: Error) {
      console.log(e.message);
      onContractWriteError && onContractWriteError(e);
    },
  });

  const approvals = useApprove({
    chainId,
    targetAddress: debouncedAuction.token,
    owner: safeAddress || address,
    spender: CONTRACT_ADDRESSES[chainId]?.FACTORY,
    safeAddress: safeAddress,
    onSuccessWrite(data) {
      onApprovalTxSent && onApprovalTxSent(data);
    },
    onSuccessConfirm(data) {
      onApprovalTxConfirmed && onApprovalTxConfirmed(data);
      prepareFn.refetch();
    },
    enabled:
      (!!safeAddress || !!address) && !!debouncedAuction.token && isAddress(debouncedAuction.token),
  });

  return {
    formikProps,
    approvals,
    prepareFn,
    writeFn,
    tokenData,
    balance,
    debouncedAuction,
    getEncodedArgs,
    getDecodedArgs,
    getTransactionRawData,
  };
}
