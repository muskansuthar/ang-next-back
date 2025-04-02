import express from 'express'
import { Edge } from '../models/edge.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const edgeList = await Edge.find()

        if (!edgeList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            edges : edgeList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedEdge = await Edge.findByIdAndDelete(req.params.id)

    if (!deletedEdge) {
        return res.status(404).json({
            message: 'Edge not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Edge Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "edge name is required"
        })
    }

    const edge = await Edge.findOne({ name });
    if (edge) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "edge already exists"
        })
    }

    const newedge = await Edge.create({
        name
    })

    if (!newedge) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding edge"
        })
    }

    return res.status(201).json(newedge)
})

export default router;   