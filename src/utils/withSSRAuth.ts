import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";

import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (!cookies["auth_jwt.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false
        }
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, "auth_jwt.token");
        destroyCookie(ctx, "auth_jwt.refreshToken");

        return {
          redirect: {
            destination: "/",
            permanent: false
          }
        }
      }
    }

  }
}
