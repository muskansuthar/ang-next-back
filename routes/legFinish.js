import express from 'express';
import { Legfinish } from '../models/legFinish.js';

const router = express.Router();

// Get all leg finishes
router.get('/', async (req, res) => {
    try {
        const legFinishList = await Legfinish.find();

        if (!legFinishList || legFinishList.length === 0) {
            return res.status(404).json({ error: true, msg: "No leg finishes found" });
        }

        return res.status(200).json({ legFinishes: legFinishList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching leg finishes", details: error.message });
    }
});

// Delete a leg finish
router.delete('/:id', async (req, res) => {
    try {
        const deletedLegfinish = await Legfinish.findByIdAndDelete(req.params.id);

        if (!deletedLegfinish) {
            return res.status(404).json({ error: true, msg: "Legfinish not found!" });
        }

        return res.status(200).json({ success: true, msg: "Legfinish Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the legfinish", details: error.message });
    }
});

// Create a new leg finish
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Legfinish name is required" });
        }

        const existingLegfinish = await Legfinish.findOne({ name });
        if (existingLegfinish) {
            return res.status(400).json({ error: true, msg: "Legfinish already exists" });
        }

        const newLegfinish = await Legfinish.create({ name });

        if (!newLegfinish) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding legfinish" });
        }

        return res.status(201).json(newLegfinish);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding legfinish", details: error.message });
    }
});

export default router;
