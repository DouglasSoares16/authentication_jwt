import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["auth_jwt.token"]}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === "token.expired") {
      cookies = parseCookies();

      const { "auth_jwt.refreshToken": refreshToken } = cookies
      const originalConfig = error.config;

      if (!isRefreshing) {
        isRefreshing = true;

        api.post("/refresh", {
          refreshToken
        }).then(response => {
          const { token } = response.data;

          setCookie(undefined, "auth_jwt.token", response.data.token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/"
          });

          setCookie(undefined, "auth_jwt.refreshToken", response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/"
          });

          api.defaults.headers["Authorization"] = `Bearer ${token}`;

          failedRequestsQueue.forEach((request) => request.onSuccess(token));

          failedRequestsQueue = [];
        }).catch(err => {
          failedRequestsQueue.forEach((request) => request.onFailure(err));

          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        });
      }

      return new Promise(( resolve, reject ) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers["Authorization"] = `Bearer ${token}`;

            resolve(api(originalConfig));
          },
          onFailure: (error: AxiosError) => {
            reject(error);
          },
        })
      });
    } else {

    }
  }
});
