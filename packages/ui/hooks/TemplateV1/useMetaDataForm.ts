import { useEffect, useState } from "react";
import { useFormik, FormikProps } from "formik";
import { MetaData, validateMetaData } from "lib/types/Auction";
import { getSupportedChain } from "lib/utils/chain";

export default function useMetaDataForm({
  chainId,
  contractId,
  minRaisedAmount,
  onSubmitSuccess,
  onSubmitError,
  auctionMetaData,
}: {
  chainId: number;
  contractId?: `0x${string}`;
  minRaisedAmount: number; // Numbers that take decimals into account. e.g. 10
  onSubmitSuccess?: (result: Response) => void;
  onSubmitError?: (e: Error) => void;
  auctionMetaData?: MetaData;
}): {
  formikProps: FormikProps<MetaData>;
  submitError: Error | null;
} {
  const [submitError, setSubmitError] = useState<Error | null>(null);
  let initMetaData: MetaData = {
    id: "",
    chainId,
    title: "",
    description: "",
    terms: "",
    projectURL: "",
    logoURL: "",
    otherURL: "",
    targetTotalRaised: minRaisedAmount,
    maximumTotalRaised: minRaisedAmount,
  };

  useEffect(() => {
    formikProps.setFieldValue("id", contractId);
  }, [contractId, minRaisedAmount]);

  const handleSubmit = async (auctionData: MetaData) => {
    try {
      const chain = getSupportedChain(chainId);
      if (!chain) throw Error("Wrong chain");

      const result = await fetch(`/api/metadata/${chain.id}`, {
        credentials: "same-origin",
        method: auctionMetaData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...auctionData, chainId }),
      });
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`${errorText}`);
      }
      onSubmitSuccess && onSubmitSuccess(result);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      setSubmitError(error);
      onSubmitError && onSubmitError(error);
    }
  };

  const formikProps = useFormik({
    enableReinitialize: true,
    initialValues: auctionMetaData || initMetaData,
    onSubmit: handleSubmit,
    validate: (value: MetaData) => validateMetaData({ ...value, chainId }, minRaisedAmount),
  });

  return {
    formikProps,
    submitError,
  };
}
