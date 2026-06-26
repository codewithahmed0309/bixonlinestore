import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/* ---------------- SAFE WRAPPER ---------------- */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ---------------- GET ALL PRODUCTS (PUBLIC: storefront) ---------------- */
router.get("/", asyncHandler(getProducts));

/* ---------------- CREATE PRODUCT (PROTECTED) ---------------- */
router.post(
  "/create",
  auth,
  upload.array("images", 5),
  asyncHandler(createProduct)
);

/* ---------------- UPDATE PRODUCT (PROTECTED) ---------------- */
router.put(
  "/:id",
  auth,
  upload.array("images", 5),
  asyncHandler(updateProduct)
);

/* ---------------- DELETE PRODUCT (PROTECTED) ---------------- */
router.delete("/:id", auth, asyncHandler(deleteProduct));

export default router;
