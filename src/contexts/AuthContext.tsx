import { createContext, ReactNode, useState } from "react";
import Router from "next/router";
import { setCookie } from "nookies";

import { api } from "../services/api";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const { data } = await api.post("sessions", {
        email,
        password
      });

      setCookie(undefined, "auth_jwt.token", data.token, {
        maxAge: 60 * 60 * 24 *30, // 30 days
        path: "/"
      });
      
      setCookie(undefined, "auth_jwt.refreshToken", data.refreshToken, {
        maxAge: 60 * 60 * 24 *30, // 30 days
        path: "/"
      });

      setUser({
        email,
        permission: data.permissions,
        roles: data.roles,
      });

      Router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
