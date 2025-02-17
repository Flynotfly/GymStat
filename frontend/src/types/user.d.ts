export interface User {
  fullName: string;
  avatarLetter: string;
  email: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}