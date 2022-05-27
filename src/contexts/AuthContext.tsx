import { createContext, ReactNode, useState, useEffect } from "react";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";

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

export function signOut() {
  destroyCookie(undefined, "auth_jwt.token");
  destroyCookie(undefined, "auth_jwt.refreshToken");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "auth_jwt.token": token } = parseCookies();

    if (token) {
      api.get("/me").then(response => {
        const { email, permissions, roles } = response.data;

        setUser({
          email,
          permissions,
          roles
        });
      }).catch(() => {
        signOut();
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const { data } = await api.post("sessions", {
        email,
        password
      });

      setCookie(undefined, "auth_jwt.token", data.token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      });

      setCookie(undefined, "auth_jwt.refreshToken", data.refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      });

      setUser({
        email,
        permissions: data.permissions,
        roles: data.roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${data.token}`;

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
