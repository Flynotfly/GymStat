export interface AuthContextValue {
  auth: AuthData | false | undefined;
  config: any;
}

export interface AuthData {
  data: AuthDataDetails;
  meta: AuthMeta;
  status: number;
}

export interface AuthDataDetails {
  user: User;
  methods: AuthMethod[];
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