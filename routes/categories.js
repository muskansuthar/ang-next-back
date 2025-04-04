import express from 'express';
import { Category } from '../models/category.js';

const router = express.Router();

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
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ error: true, msg: "Category not found!" });
        }

        return res.status(200).json({ success: true, msg: "Category Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the category", details: error.message });
    }
});

// Create category
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: true, msg: "Category already exists" });
        }

        const newCategory = await Category.create({ name });

        if (!newCategory) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding the category" });
        }

        return res.status(201).json(newCategory);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding the category", details: error.message });
    }
});

export default router;
