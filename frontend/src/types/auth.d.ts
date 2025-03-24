export interface AuthContextValue {
  auth: AuthData | false | undefined;
  config: any;
}

export interface AuthData {
  user: User;
  methods: AuthMethod[];
  meta: AuthMeta;
  status: number;
}

export interface User {
  id: number;
  display: string;
  email: string;
  has_usable_password: boolean;
}

export interface AuthMethod {
  at: number;
  email: string;
  method: string;
}

export interface AuthMeta {
  is_authenticated: boolean;
}