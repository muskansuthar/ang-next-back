import express from 'express';
import { Legmaterial } from '../models/legMaterial.js';

const router = express.Router();

// Get all leg materials
router.get('/', async (req, res) => {
    try {
        const legmaterialList = await Legmaterial.find();

        if (!legmaterialList || legmaterialList.length === 0) {
            return res.status(404).json({ error: true, msg: "No leg materials found" });
        }

        return res.status(200).json({ legMaterials: legmaterialList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching leg materials", details: error.message });
    }
});

// Delete a leg material
router.delete('/:id', async (req, res) => {
    try {
        const deletedLegmaterial = await Legmaterial.findByIdAndDelete(req.params.id);

        if (!deletedLegmaterial) {
            return res.status(404).json({ error: true, msg: "Legmaterial not found!" });
        }

        return res.status(200).json({ success: true, msg: "Legmaterial Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the leg material", details: error.message });
    }
});

// Create a new leg material
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Legmaterial name is required" });
        }

        const existingLegmaterial = await Legmaterial.findOne({ name });
        if (existingLegmaterial) {
            return res.status(400).json({ error: true, msg: "Legmaterial already exists" });
        }

        const newLegmaterial = await Legmaterial.create({ name });

        if (!newLegmaterial) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding legmaterial" });
        }

        return res.status(201).json(newLegmaterial);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding legmaterial", details: error.message });
    }
});

export default router;
