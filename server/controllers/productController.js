import cloudinary from "../config/cloudinary.js";
import { supabase } from "../config/supabase.js";
import { Readable } from "stream";
import crypto from "crypto";

/* ============================================
   CREATE PRODUCT (with duplicate prevention)
   ============================================ */
export const createProduct = async (req, res) => {
  try {const {
  name,
  brand,
  category,
  original_price,
  sale_price,
  stock,
} = req.body;

    // ✅ STEP 1: VALIDATE ALL INPUTS FIRST (before any async work)
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name is required" });
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
    message: "Sale price cannot exceed original price",
  });
}
    if (stock === undefined || isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "Invalid stock count" });
    }

    // Validate file size (should already be caught by multer, but double-check)
    if (req.files && req.files.size > 3 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be under 3MB" });
    }

    // ✅ STEP 2: UPLOAD IMAGE TO CLOUDINARY (if provided)
    // Use idempotency key in public_id to prevent duplicate uploads
    let imageUrl = null;
    if (req.files) {
      try {
        // Generate idempotency key based on file hash
        const fileHash = crypto
          .createHash("md5")
          .update(req.files.buffer)
          .digest("hex");
        const publicId = `products/${fileHash}`;

        // Stream buffer to Cloudinary (more efficient than creating temp file)
        const stream = Readable.from(req.files.buffer);
        const uploadResult = await new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { public_id: publicId, folder: "products", overwrite: false },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(upload);
        });

        imageUrl = uploadResult.secure_url;
        console.log("Image uploaded to Cloudinary:", imageUrl);
      } catch (uploadErr) {
  console.error("========== CLOUDINARY ERROR ==========");
  console.error(uploadErr);
  console.error("====================================");

  return res.status(400).json({
    message: "Image upload failed",
    details: uploadErr.message,
  });
}
    }

    // ✅ STEP 3: PREPARE DATA FOR DATABASE
    const productData = {
      name: name.trim(),
      brand: brand?.trim() || null,
      category: category?.trim() || null,
      price: Number(price),
      stock: Number(stock),
      image: imageUrl,
    };

    // ✅ STEP 4: INSERT INTO SUPABASE (only after all prep is done)
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);

      // If it's a unique constraint error, tell user product already exists
      if (insertError.code === "23505") {
        return res.status(409).json({
          message: "A product with this name already exists",
        });
      }

      return res.status(400).json({
        message: "Failed to create product",
        details: insertError.message,
      });
    }

    // ✅ STEP 5: RETURN SUCCESS (only if everything above succeeded)
    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error("Unexpected error in createProduct:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ message: "Failed to fetch products" });
    }

    // Always return array (even if empty)
    res.status(200).json({
      data: products || [],
    });

  } catch (error) {
    console.error("Unexpected error in getProducts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   UPDATE PRODUCT
   ============================================ */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, price, stock } = req.body;

    // Validate inputs
    if (name && !name.trim()) {
      return res.status(400).json({ message: "Product name cannot be empty" });
    }
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ message: "Invalid price" });
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
      return res.status(400).json({ message: "Invalid stock" });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (brand) updateData.brand = brand.trim();
    if (category) updateData.category = category.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);

    // Handle image upload if provided
    if (req.files) {
      try {
        const fileHash = crypto
          .createHash("md5")
          .update(req.files.buffer)
          .digest("hex");
        const publicId = `products/${fileHash}`;

        const stream = Readable.from(req.files.buffer);
        const uploadResult = await new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { public_id: publicId, folder: "products", overwrite: true },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(upload);
        });

        updateData.image = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Image upload failed:", uploadErr);
        return res.status(400).json({ message: "Image upload failed" });
      }
    }

    // Update database
    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(400).json({ message: "Failed to update product" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {
    console.error("Unexpected error in updateProduct:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   DELETE PRODUCT
   ============================================ */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase delete error:", error);
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(400).json({ message: "Failed to delete product" });
    }

    // If there's an image, optionally delete it from Cloudinary
    if (product?.image) {
      try {
        const publicId = `products/${product.image.split("/").pop().split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
        console.log("Image deleted from Cloudinary:", publicId);
      } catch (cloudErr) {
        // Don't fail the delete if Cloudinary cleanup fails
        console.warn("Failed to delete image from Cloudinary:", cloudErr);
      }
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });

  } catch (error) {
    console.error("Unexpected error in deleteProduct:", error);
    res.status(500).json({ message: "Server error" });
  }
};
