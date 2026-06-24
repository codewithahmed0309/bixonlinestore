import api from "./api"; // IMPORTANT: use same axios instance

/* ---------------- PRODUCTS API ---------------- */

export const productsApi = {
  list: async () => {
    const res = await api.get("/products");

    const data =
      res.data?.data ||
      res.data?.products ||
      res.data ||
      [];

    return Array.isArray(data) ? data : [];
  },

  create: (data: FormData) =>
    api.post("/products/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};