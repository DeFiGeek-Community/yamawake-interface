import type { UseMutationOptions } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query/src/types";
import type { QueryFunctionContext } from "@tanstack/react-query";

export type MutationConfig<Data, Error, Variables = void> = {
  /** Function fires if mutation encounters error */
  onError?: UseMutationOptions<Data, Error, Variables>["onError"];
  /**
   * Function fires before mutation function and is passed same variables mutation function would receive.
   * Value returned from this function will be passed to both onError and onSettled functions in event of a mutation failure.
   */
  onMutate?: UseMutationOptions<Data, Error, Variables>["onMutate"];
  /** Function fires when mutation is either successfully fetched or encounters error */
  onSettled?: UseMutationOptions<Data, Error, Variables>["onSettled"];
  /** Function fires when mutation is successful and will be passed the mutation's result */
  onSuccess?: UseMutationOptions<Data, Error, Variables>["onSuccess"];
};

export type QueryConfig<TData, TError, TSelectData = TData> = Pick<
  UseQueryOptions<TData, TError, TSelectData>,
  | "cacheTime"
  | "enabled"
  | "isDataEqual"
  | "staleTime"
  | "structuralSharing"
  | "suspense"
  | "onError"
  | "onSettled"
  | "onSuccess"
> & {
  /** Scope the cache to a given context. */
  scopeKey?: string;
};

export type QueryFunctionArgs<T extends (...args: any) => any> = QueryFunctionContext<
  ReturnType<T>
>;
