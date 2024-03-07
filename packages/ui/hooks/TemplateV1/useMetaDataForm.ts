import { useEffect, useState } from "react";
import { useFormik, FormikProps } from "formik";
import { MetaData, validateMetaData } from "lib/types/Auction";

export default function useMetaDataForm({
  contractId,
  minRaisedAmount,
  onSubmitSuccess,
  onSubmitError,
  auctionMetaData,
}: {
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
      const result = await fetch("/api/metadata", {
        credentials: "same-origin",
        method: auctionMetaData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(auctionData),
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
    validate: (value: MetaData) => validateMetaData(value, minRaisedAmount),
  });

  return {
    formikProps,
    submitError,
  };
}
