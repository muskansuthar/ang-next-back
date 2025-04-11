import express from 'express';
import { Category } from '../models/category.js';
import multer from "multer";
import fs from "fs"
import path from "path";

const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads")
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList || categoryList.length === 0) {
      return res.status(404).json({ error: true, msg: "No categories found" });
    }

    return res.status(200).json({ categoryList: categoryList });
  } catch (error) {
    return res.status(500).json({ error: true, msg: "An error occurred while fetching categories", details: error.message });
  }
});

// Search category by name
router.get('/search', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: true, msg: "Please provide a name to search" });
  }

  try {
    const regex = new RegExp(name, 'i'); // case-insensitive search
    const categories = await Category.find({ name: regex });

    if (!categories.length) {
      return res.status(404).json({ error: true, msg: "No categories matched your search" });
    }

    return res.status(200).json({ categoryList: categories });
  } catch (error) {
    return res.status(500).json({
      error: true,
      msg: "An error occurred during the search",
      details: error.message,
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: true, msg: "The category with the given ID was not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: true, msg: "An error occurred while fetching the category", details: error.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    const images = category.images;

    if (images.length !== 0) {
      for (let image of images) {
        fs.unlinkSync(`uploads/${image}`)
      }
    }
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ error: true, msg: "Category not found!" });
    }

    return res.status(200).json({ success: true, msg: "Category Deleted!" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: "An error occurred while deleting the category", details: error.message });
  }
});

router.post("/create", upload.array("images"), async (req, res) => {
  try {
    const { name } = req.body;
    const files = req.files;

    if (!name) {
      return res.status(400).json({ error: true, msg: "Category name is required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: true, msg: "At least one image is required" });
    }

    // ✅ Check if category already exists by name (case-insensitive)
    const existingCategory = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existingCategory) {
      // Delete uploaded files since the category exists
      files.forEach(file => {
        const filePath = path.join("uploads", file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      return res.status(409).json({ error: true, msg: "Category with this name already exists" });
    }

    const imagePaths = files.map(file => file.filename);

    const newCategory = new Category({
      name: name.trim(),
      images: imagePaths,
    });

    await newCategory.save();

    res.status(201).json({ error: false, msg: "Category created successfully", data: newCategory });
  } catch (err) {
    return res.status(500).json({ error: true, msg: "Failed to create category" });
  }
});

// PUT /api/category/:id
router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const { name } = req.body.name;
    const files = req.files;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: true, msg: "Category not found" });
    }
    
    let imagePaths;

    if (files?.length > 0) {
      // Delete old images from disk
      if (category.images?.length) {
        category.images.forEach(img => {
          const filePath = path.join("uploads", img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }

      // Save new image paths
      imagePaths = files.map(file => file.filename);
    } else {
      // No new images, keep old ones
      imagePaths = category.images;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: imagePaths,
      },
      { new: true }
    );

    if (!updatedCategory) {
      // Cleanup uploaded files if DB update failed
      if (files?.length > 0) {
        files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
      }
      return res.status(500).json({ error: true, msg: "Category update failed" });
    }

    return res.status(200).json({ error: false, msg: "Category updated successfully", data: updatedCategory });
  } catch (err) {
    return res.status(500).json({ error: true, msg: "Failed to update category" });
  }
});


export default router;

