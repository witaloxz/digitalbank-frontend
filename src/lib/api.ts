import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

const isPublicEndpoint = (config: InternalAxiosRequestConfig) => {
  const { url, method } = config;
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => url === endpoint);
  const isRegistration = url === "/users" && method?.toLowerCase() === "post";
  return isPublic || isRegistration;
};

api.interceptors.request.use(
  (config) => {
    if (!isPublicEndpoint(config)) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isPublicEndpoint(originalRequest)) {
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
            const { access_token } = response.data;

            localStorage.setItem("access_token", access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 503) {
        if (!window.location.pathname.includes("/maintenance")) {
          sessionStorage.setItem("redirectAfterMaintenance", window.location.pathname + window.location.search);
          window.location.href = "/maintenance";
        }
        return Promise.reject(error);
      }

      const errorMessage = data?.message || data?.error || (typeof data === "string" ? data : "Ocorreu um erro inesperado.");

      switch (status) {
        case 403:
          toast.error("Acesso negado. Você não tem permissão para esta ação.");
          break;
        case 404:
          toast.error("Recurso não encontrado.");
          break;
        case 409:
          toast.error(`Conflito: ${errorMessage}`);
          break;
        case 422:
          toast.error(`Dados inválidos: ${errorMessage}`);
          break;
        case 500:
          toast.error("Erro interno do servidor. Tente novamente mais tarde.");
          break;
        default:
          if (status !== 401) {
            toast.error(errorMessage);
          }
      }
    } else if (error.request) {
      toast.error("Não foi possível conectar ao servidor. Verifique sua conexão.");
    } else {
      toast.error(`Erro na requisição: ${error.message}`);
    }

    return Promise.reject(error);
  }
);