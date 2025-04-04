import express from 'express';
import { Top } from '../models/top.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const topList = await Top.find();

        if (!topList || topList.length === 0) {
            return res.status(404).json({ error: true, msg: "No tops found" });
        }

        return res.status(200).json({ tops: topList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching tops", details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedTop = await Top.findByIdAndDelete(req.params.id);

        if (!deletedTop) {
            return res.status(404).json({ error: true, msg: "Top not found!" });
        }

        return res.status(200).json({ success: true, msg: "Top Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting top", details: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Top name is required" });
        }

        const topExists = await Top.findOne({ name });
        if (topExists) {
            return res.status(400).json({ error: true, msg: "Top already exists" });
        }

        const newTop = await Top.create({ name });

        if (!newTop) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding top" });
        }

        return res.status(201).json(newTop);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding top", details: error.message });
    }
});

export default router;
