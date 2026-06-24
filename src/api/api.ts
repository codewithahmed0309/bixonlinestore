import axios from "axios";

/* ---------------- TYPES ---------------- */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  brand?: string;
  category?: string;
  image?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}

export interface ProductsListResponse {
  data: Product[];
}

/* ---------------- CONFIG ---------------- */

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://bixonlinestore.onrender.com";

const TOKEN_KEY = "ml_admin_token";
const ADMIN_KEY = "ml_admin_profile";

/* ---------------- TOKEN STORAGE ---------------- */

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/* ---------------- AXIOS INSTANCE ---------------- */

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

/* ---------------- REQUEST DEBUG (IMPORTANT) ---------------- */

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    "➡️ API REQUEST:",
    config.method?.toUpperCase(),
    config.baseURL + config.url
  );

  return config;
});

/* ---------------- RESPONSE DEBUG ---------------- */

api.interceptors.response.use(
  (res) => {
    console.log("✅ API RESPONSE:", res.config.url);
    return res;
  },
  (err) => {
    console.log("❌ API ERROR:", err.config?.url, err.message);

    if (err.response?.status === 401) {
      tokenStorage.clear();
      localStorage.removeItem(ADMIN_KEY);
      window.location.href = "/admin/login";
    }

    return Promise.reject({
      message: err.response?.data?.message || "API Error",
      status: err.response?.status,
    });
  }
);

/* ---------------- AUTH API ---------------- */
export const authApi = {
  login: (data: LoginPayload) => api.post("/auth/login", data),
};

/* ---------------- PRODUCTS API ---------------- */

export const productsApi = {
  list: () => api.get<ProductsListResponse>("/products"),

  get: (id: string) => api.get<{ data: Product }>(`/products/${id}`),

  create: (formData: FormData) =>
    api.post<{ message: string; data: Product }>("/products/create", formData),

  update: (id: string, formData: FormData) =>
    api.put<{ message: string; data: Product }>(`/products/${id}`, formData),

  remove: (id: string) =>
    api.delete<{ message: string; data: Product }>(`/products/${id}`),
};

export default api;
