import api from "./api"; // reuses the same shared axios instance (baseURL, auth token, error handling)

/* ---------------- TYPES ---------------- */

export interface Category {
  id: string;
  name: string;
}

export interface CategoriesListResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

/* ---------------- CATEGORIES API ---------------- */

export const categoriesApi = {
  list: () => api.get<CategoriesListResponse>("/categories"),

  create: (name: string) =>
    api.post<CategoryResponse>("/categories", { name }),

  update: (id: string, name: string) =>
    api.put<CategoryResponse>(`/categories/${id}`, { name }),

  remove: (id: string) => api.delete(`/categories/${id}`),
};