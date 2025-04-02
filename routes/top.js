import express from 'express'
import { Top } from '../models/top.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const topList = await Top.find()

        if (!topList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            tops : topList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedTop = await Top.findByIdAndDelete(req.params.id)

    if (!deletedTop) {
        return res.status(404).json({
            message: 'Top not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Top Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "top name is required"
        })
    }

    const top = await Top.findOne({ name });
    if (top) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "top already exists"
        })
    }

    const newtop = await Top.create({
        name
    })

    if (!newtop) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding top"
        })
    }

    return res.status(201).json(newtop)
})

export default router;   