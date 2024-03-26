import { FC, ReactNode } from "react";
import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import CurrentUserContext from "../../contexts/CurrentUserContext";

export const CurrentUserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data, mutate, error } = useCurrentUser();

  return (
    <CurrentUserContext.Provider value={{ currentUser: data, mutate, error }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
