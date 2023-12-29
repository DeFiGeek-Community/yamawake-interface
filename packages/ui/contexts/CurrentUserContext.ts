import { createContext } from "react";
import { KeyedMutator } from "swr";
import { User } from "lib/types";

export type CurrentUserContextType = {
  currentUser?: User;
  mutate?: KeyedMutator<User | undefined>;
  error?: Error;
};

const CurrentUserContext = createContext<CurrentUserContextType>({});
export default CurrentUserContext;
