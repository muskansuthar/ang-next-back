import express from 'express';
import { Finish } from '../models/finish.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const finishList = await Finish.find();

        if (!finishList || finishList.length === 0) {
            return res.status(404).json({ error: true, msg: "No finishes found" });
        }

        return res.status(200).json({ finishes: finishList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching finishes", details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedFinish = await Finish.findByIdAndDelete(req.params.id);

        if (!deletedFinish) {
            return res.status(404).json({ error: true, msg: "Finish not found!" });
        }

        return res.status(200).json({ success: true, msg: "Finish Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting finish", details: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Finish name is required" });
        }

        const finishExists = await Finish.findOne({ name });
        if (finishExists) {
            return res.status(400).json({ error: true, msg: "Finish already exists" });
        }

        const newFinish = await Finish.create({ name });

        if (!newFinish) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding finish" });
        }

        return res.status(201).json(newFinish);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding finish", details: error.message });
    }
});

export default router;
