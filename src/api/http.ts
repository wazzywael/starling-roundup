import axios, { type AxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const http = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: async <T = any>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await instance.request<T>(config);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        throw new Error(
          `HTTP ${error.response.status}: ${
            error.response.data?.error_description || error.message
          }`
        );
      }
      throw new Error("Unexpected error occurred");
    }
  },
};
