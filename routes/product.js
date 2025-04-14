import express from "express";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
import { Legfinish } from "../models/legFinish.js";
import { Legmaterial } from "../models/legMaterial.js";
import { Topfinish } from "../models/topFinish.js";
import { Topmaterial } from "../models/topMaterial.js";
import multer from "multer";
import fs from "fs";
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get("/featured", async (req, res) => {
  const productList = await Product.find({ isFeatured: true });

  if (!productList) {
    return res.status(500).json({ error: true, msg: "Featured Products not found" });
  }

  return res.status(200).json(productList);
});

router.get("/filter", async (req, res) => {
  try {
    let query = {};

    // If category is provided, filter by it
    if (req.query.category) {
      const category = await Category.findOne({ name: req.query.category });
      if (category) {
        query.category = category._id;
      }
    }

    // Add other filters
    if (req.query.topmaterial) query.topmaterial = req.query.topmaterial;
    if (req.query.legmaterial) query.legmaterial = req.query.legmaterial;
    if (req.query.topfinish) query.topfinish = req.query.topfinish;
    if (req.query.legfinish) query.legfinish = req.query.legfinish;

    const productList = await Product.find(query).populate(
      "category legfinish legmaterial topfinish topmaterial"
    );

    return res.status(200).json({ products: productList });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
});

router.get("/category", async (req, res) => {
  try {
    const categoryId = req.query.category; // Get the category value from the query string

    if (!categoryId) {
      return res
        .status(400)
        .json({ error: true, msg: "Category is required" });
    }

    // Find products that match the category
    const productList = await Product.find({ category: categoryId }).populate(
      "category legfinish legmaterial topfinish topmaterial"
    );

    return res.status(200).json({ products: productList });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const productList = await Product.find().populate(
      "category legfinish legmaterial topfinish topmaterial"
    );

    if (!productList) {
      return res.status(500).json({ error: true, msg: "Products not found" });
    }
    return res.status(200).json({
      products: productList,
    });
  } catch (error) {
    return res.status(500).json({ error: true, msg: "Server error" });
  }
});

router.post("/create", upload.array("images"), async (req, res) => {
  try {
    const { category, legfinish, legmaterial, topfinish, topmaterial, name } = req.body;
    const files = req.files;

    // Validate inputs
    if (!category || !legfinish || !legmaterial) {
      return res.status(400).json({ error: true, msg: "Category, legfinish, and legmaterial are required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: true, msg: "At least one image is required" });
    }

    // Check if the product already exists by name
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      // Cleanup uploaded files if the product already exists
      if (files && files.length > 0) {
        files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
      }

      return res.status(409).json({ error: true, msg: "Product with this name already exists" });
    }

    // Check existence of category, legfinish, and legmaterial
    const [categoryExists, legfinishExists, legmaterialExists] = await Promise.all([
      Category.findById(category),
      Legfinish.findById(legfinish),
      Legmaterial.findById(legmaterial),
    ]);

    if (!categoryExists) {
      return res.status(404).json({ error: true, msg: "Invalid Category!" });
    }
    if (!legfinishExists) {
      return res.status(404).json({ error: true, msg: "Invalid Legfinish!" });
    }
    if (!legmaterialExists) {
      return res.status(404).json({ error: true, msg: "Invalid Legmaterial!" });
    }

    // Check for topfinish and topmaterial if provided
    let topfinishId = topfinish?.trim() ? topfinish : null;
    let topmaterialId = topmaterial?.trim() ? topmaterial : null;

    if (topfinishId) {
      const topfinishExists = await Topfinish.findById(topfinishId);
      if (!topfinishExists) {
        return res.status(404).json({ error: true, msg: "Invalid Topfinish!" });
      }
    }

    if (topmaterialId) {
      const topmaterialExists = await Topmaterial.findById(topmaterialId);
      if (!topmaterialExists) {
        return res.status(404).json({ error: true, msg: "Invalid Topmaterial!" });
      }
    }

    // Process files (images)
    const imagePaths = files.map(file => file.filename);

    // Create the new product
    let product = new Product({
      name: req.body.name,
      images: imagePaths,
      category: category,
      legfinish: legfinish,
      legmaterial: legmaterial,
      topfinish: topfinishId,
      topmaterial: topmaterialId,
      height: req.body.height,
      width: req.body.width,
      length: req.body.length,
      cbm: req.body.cbm,
      isFeatured: req.body.isFeatured,
    });

    // Save product to the database
    product = await product.save();

    if (!product) {
      // Cleanup uploaded images on error
      if (files && files.length > 0) {
        files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
      }
      return res.status(500).json({
        error: true,
        msg: "Failed to create product"
      });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      msg: "Product created successfully",
      product
    });

  } catch (err) {
    // Cleanup on error
    if (req.files?.length) {
      req.files.forEach(file => {
        fs.unlinkSync(path.join('uploads', file.filename));
      });
    }

    return res.status(500).json({
      error: true,
      msg: process.env.NODE_ENV === 'production'
        ? "Server error"
        : err.message
    });
  }
});


router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category legfinish legmaterial topfinish topmaterial"
  );

  if (!product) {
    return res
      .status(500)
      .json({ error: true, msg: "The product with the given ID was not found" });
  }

  return res.status(200).send(product);
});


router.delete("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const images = product.images;

  if (images.length !== 0) {
    for (let image of images) {
      fs.unlinkSync(`uploads/${image}`);
    }
  }

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    res.status(404).json({
      error: true,
      msg: "Product not found!",
    });
  }

  return res.status(200).json({
    error: true,
    msg: "Product Deleted!",
  });
});

router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const { category, legfinish, legmaterial, topfinish, topmaterial, name } = req.body;
    const files = req.files;

    if (!category || !legfinish || !legmaterial || !name) {
      return res.status(400).json({ error: true, msg: "Name, category, legfinish, and legmaterial are required" });
    }

    const [categoryExists, legfinishExists, legmaterialExists] = await Promise.all([
      Category.findById(category),
      Legfinish.findById(legfinish),
      Legmaterial.findById(legmaterial),
    ]);

    if (!categoryExists) return res.status(404).json({ error: true, msg: "Invalid Category!" });
    if (!legfinishExists) return res.status(404).json({ error: true, msg: "Invalid Legfinish!" });
    if (!legmaterialExists) return res.status(404).json({ error: true, msg: "Invalid Legmaterial!" });

    let topfinishId = topfinish?.trim() ? topfinish : null;
    let topmaterialId = topmaterial?.trim() ? topmaterial : null;

    if (topfinishId) {
      const topfinishExists = await Topfinish.findById(topfinishId);
      if (!topfinishExists) return res.status(404).json({ error: true, msg: "Invalid Topfinish!" });
    }

    if (topmaterialId) {
      const topmaterialExists = await Topmaterial.findById(topmaterialId);
      if (!topmaterialExists) return res.status(404).json({ error: true, msg: "Invalid Topmaterial!" });
    }

    // Get existing product
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: true, msg: "Product not found" });
    }

    let imagePaths;

    if (files?.length > 0) {
      // Delete old images from disk
      if (existingProduct.images?.length) {
        existingProduct.images.forEach(img => {
          const filePath = path.join("uploads", img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }

      // Save new image paths
      imagePaths = files.map(file => file.filename);
    } else {
      // No new images, keep old ones
      imagePaths = existingProduct.images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category,
        legfinish,
        legmaterial,
        topfinish: topfinishId,
        topmaterial: topmaterialId,
        height: req.body.height,
        width: req.body.width,
        length: req.body.length,
        cbm: req.body.cbm,
        isFeatured: req.body.isFeatured,
        images: imagePaths,
      },
      { new: true }
    );

    if (!updatedProduct) {
      // Cleanup uploaded files if DB update failed
      if (files?.length > 0) {
        files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
      }
      return res.status(500).json({ error: true, msg: "Product update failed" });
    }

    return res.status(200).json({
      success: true,
      msg: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (err) {
    // Cleanup new uploads on error
    if (req.files?.length) {
      req.files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
    }

    return res.status(500).json({
      error: true,
      msg: process.env.NODE_ENV === 'production' ? "Server error" : err.message
    });
  }
});

export default router;
