export interface AuthData {
  user: User;
  methods: AuthMethod[];
}

export interface User {
  id: number;
  display: string;
  has_usable_password: boolean;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface AuthMethod {
  method: string;
  at: number; // Unix timestamp
  email: string;
  username: string;
}