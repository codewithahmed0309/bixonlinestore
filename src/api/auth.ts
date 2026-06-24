import api from "./api";

export const loginAdmin = async (data: {
  email: string;
  password: string;
}) => {
  return api.post("/admin/login", data);
};