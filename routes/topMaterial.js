import express from 'express';
import { Topmaterial } from '../models/topMaterial.js';

const router = express.Router();

// Get all top materials
router.get('/', async (req, res) => {
    try {
        const topMaterialList = await Topmaterial.find();

        if (!topMaterialList || topMaterialList.length === 0) {
            return res.status(404).json({ error: true, msg: "No top materials found" });
        }

        return res.status(200).json({ topMaterials: topMaterialList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching top materials", details: error.message });
    }
});

// Delete a top material
router.delete('/:id', async (req, res) => {
    try {
        const deletedTopMaterial = await Topmaterial.findByIdAndDelete(req.params.id);

        if (!deletedTopMaterial) {
            return res.status(404).json({ error: true, msg: "Topmaterial not found!" });
        }

        return res.status(200).json({ success: true, msg: "Topmaterial Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the top material", details: error.message });
    }
});

// Create a new top material
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Topmaterial name is required" });
        }

        const existingTopMaterial = await Topmaterial.findOne({ name });
        if (existingTopMaterial) {
            return res.status(400).json({ error: true, msg: "Topmaterial already exists" });
        }

        const newTopMaterial = await Topmaterial.create({ name });

        if (!newTopMaterial) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding topmaterial" });
        }

        return res.status(201).json(newTopMaterial);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding topmaterial", details: error.message });
    }
});

export default router;
  