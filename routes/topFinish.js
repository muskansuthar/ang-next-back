import express from 'express';
import { Topfinish } from '../models/topFinish.js';

const router = express.Router();

// Get all top finishes
router.get('/', async (req, res) => {
    try {
        const topFinishList = await Topfinish.find();

        if (!topFinishList || topFinishList.length === 0) {
            return res.status(404).json({ error: true, msg: "No top finishes found" });
        }

        return res.status(200).json({ topFinishes: topFinishList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching top finishes", details: error.message });
    }
});

// Delete a top finish
router.delete('/:id', async (req, res) => {
    try {
        const deletedTopfinish = await Topfinish.findByIdAndDelete(req.params.id);

        if (!deletedTopfinish) {
            return res.status(404).json({ error: true, msg: "Topfinish not found!" });
        }

        return res.status(200).json({ success: true, msg: "Topfinish Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the top finish", details: error.message });
    }
});

// Create a new top finish
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Topfinish name is required" });
        }

        const existingTopfinish = await Topfinish.findOne({ name });
        if (existingTopfinish) {
            return res.status(400).json({ error: true, msg: "Topfinish already exists" });
        }

        const newTopfinish = await Topfinish.create({ name });

        if (!newTopfinish) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding topfinish" });
        }

        return res.status(201).json(newTopfinish);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding topfinish", details: error.message });
    }
});

export default router;
