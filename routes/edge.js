import express from 'express';
import { Edge } from '../models/edge.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const edgeList = await Edge.find();

        if (!edgeList) {
            return res.status(500).json({ error: true, msg: "Something went wrong while fetching edges" });
        }

        return res.status(200).json({ edges: edgeList });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred", details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedEdge = await Edge.findByIdAndDelete(req.params.id);

        if (!deletedEdge) {
            return res.status(404).json({ error: true, msg: 'Edge not found!' });
        }

        return res.status(200).json({ msg: 'Edge Deleted!' });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Something went wrong while deleting edge", details: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: true, msg: "Edge name is required" });
        }

        const edge = await Edge.findOne({ name });
        if (edge) {
            return res.status(400).json({ error: true, msg: "Edge already exists" });
        }

        const newEdge = await Edge.create({ name });

        if (!newEdge) {
            return res.status(500).json({ error: true, msg: "Something went wrong while adding edge" });
        }

        return res.status(201).json(newEdge);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while adding edge", details: error.message });
    }
});

export default router;
