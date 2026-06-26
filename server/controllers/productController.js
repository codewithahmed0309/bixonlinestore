import cloudinary from "../config/cloudinary.js";
import { supabase } from "../config/supabase.js";
import { Readable } from "stream";
/* ============================================
   HELPER: Upload Multiple Images to Cloudinary
   ============================================ */
const uploadImagesToCloudinary = async (files = []) => {
  if (!files.length) return [];

  const imageUrls = [];

  for (const file of files) {
    const stream = Readable.from(file.buffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.pipe(upload);
    });

    imageUrls.push(uploadResult.secure_url);
  }

  return imageUrls;
};

/* ============================================
   CREATE PRODUCT
   ============================================ */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      original_price,
      sale_price,
      stock,
    } = req.body;

    /* ---------- Validation ---------- */

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (
      original_price === undefined ||
      isNaN(original_price) ||
      Number(original_price) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid original price",
      });
    }

    if (
      sale_price === undefined ||
      isNaN(sale_price) ||
      Number(sale_price) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid sale price",
      });
    }

    if (Number(sale_price) > Number(original_price)) {
      return res.status(400).json({
        message: "Sale price cannot be greater than original price",
      });
    }

    if (
      stock === undefined ||
      isNaN(stock) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        message: "Invalid stock",
      });
    } 
    /* ---------- Upload Images ---------- */

    let imageUrls = [];

    if (req.files?.length) {
      try {
        imageUrls = await uploadImagesToCloudinary(req.files);
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        return res.status(400).json({
          message: "Image upload failed",
        });
      }
    }

    /* ---------- Save Product ---------- */

    const productData = {
      name: name.trim(),
      brand: brand?.trim() || null,
      category: category?.trim() || null,

      original_price: Number(original_price),
      sale_price: Number(sale_price),

      stock: Number(stock),

      images: imageUrls,
    };

    const { data: product, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        return res.status(409).json({
          message: "Product already exists",
        });
      }

      return res.status(400).json({
        message: "Failed to create product",
        details: error.message,
      });
    }

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
/* ============================================
   GET ALL PRODUCTS
   ============================================ */
export const getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Fetch Error:", error);

      return res.status(500).json({
        message: "Failed to fetch products",
      });
    }

    return res.status(200).json({
      data: products || [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
/* ============================================
   UPDATE PRODUCT
   ============================================ */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      brand,
      category,
      original_price,
      sale_price,
      stock,
    } = req.body;

    /* ---------- Get Existing Product ---------- */

    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* ---------- Validation ---------- */

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Product name cannot be empty",
      });
    }

    if (
      original_price !== undefined &&
      (isNaN(original_price) || Number(original_price) <= 0)
    ) {
      return res.status(400).json({
        message: "Invalid original price",
      });
    }

    if (
      sale_price !== undefined &&
      (isNaN(sale_price) || Number(sale_price) <= 0)
    ) {
      return res.status(400).json({
        message: "Invalid sale price",
      });
    }

    const finalOriginalPrice =
      original_price !== undefined
        ? Number(original_price)
        : existingProduct.original_price;

    const finalSalePrice =
      sale_price !== undefined
        ? Number(sale_price)
        : existingProduct.sale_price;

    if (finalSalePrice > finalOriginalPrice) {
      return res.status(400).json({
        message: "Sale price cannot be greater than original price",
      });
    }

    if (
      stock !== undefined &&
      (isNaN(stock) || Number(stock) < 0)
    ) {
      return res.status(400).json({
        message: "Invalid stock",
      });
    }

    /* ---------- Images ---------- */

    let imageUrls = existingProduct.images || [];

    if (req.files?.length) {
      imageUrls = await uploadImagesToCloudinary(req.files);
    }

    /* ---------- Update Object ---------- */

    const updateData = {
      name:
        name !== undefined
          ? name.trim()
          : existingProduct.name,

      brand:
        brand !== undefined
          ? brand.trim()
          : existingProduct.brand,

      category:
        category !== undefined
          ? category.trim()
          : existingProduct.category,

      original_price: finalOriginalPrice,

      sale_price: finalSalePrice,

      stock:
        stock !== undefined
          ? Number(stock)
          : existingProduct.stock,

      images: imageUrls,
    };

    /* ---------- Update Database ---------- */

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(400).json({
        message: "Failed to update product",
        details: error.message,
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
/* ============================================
   DELETE PRODUCT
   ============================================ */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------- Get Product ---------- */

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* ---------- Delete Images From Cloudinary ---------- */

    if (product.images?.length) {
      for (const imageUrl of product.images) {
        try {
          const parts = imageUrl.split("/");

          const fileName = parts[parts.length - 1];

          const publicId =
            "products/" + fileName.substring(0, fileName.lastIndexOf("."));

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Cloudinary delete failed:", err.message);
        }
      }
    }

    /* ---------- Delete Product ---------- */

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Failed to delete product",
        details: error.message,
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("SUPABASE FULL ERROR:", JSON.stringify(error, null, 2));

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
