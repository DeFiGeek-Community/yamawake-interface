import { createContext } from "react";

export type LayoutContextType = {
  allowNetworkChange?: boolean;
  setAllowNetworkChange?: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType>({});
export default LayoutContext;
