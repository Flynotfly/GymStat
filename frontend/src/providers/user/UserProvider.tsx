import {ReactNode, useState} from "react";
import UserContext from "./UserContext.ts";
import {User} from "../../types/user";

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider ({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  return(
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
