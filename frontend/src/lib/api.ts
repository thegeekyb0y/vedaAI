import axios, { AxiosError } from "axios";

type ApiErrorPayload = {
  message?: string;
  success?: boolean;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const isAxiosCanceledError = (error: unknown) =>
  error instanceof AxiosError && error.code === AxiosError.ERR_CANCELED;
