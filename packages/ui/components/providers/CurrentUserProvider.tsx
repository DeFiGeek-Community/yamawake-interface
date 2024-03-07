import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import CurrentUserContext from "../../contexts/CurrentUserContext";

export const CurrentUserProvider = (props: any) => {
  const { data, mutate, error } = useCurrentUser();

  return (
    <CurrentUserContext.Provider value={{ currentUser: data, mutate, error }}>
      {props.children}
    </CurrentUserContext.Provider>
  );
};
