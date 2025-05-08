import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const http = {
  request: async <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await instance.request<T>(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const data = axiosError.response.data as {
          error?: string;
          error_description?: string;
        };

        const message =
          data?.error_description || axiosError.message || "Unknown error";

        throw new Error(`HTTP ${axiosError.response.status}: ${message}`);
      }

      throw new Error("Unexpected error occurred");
    }
  },
};
