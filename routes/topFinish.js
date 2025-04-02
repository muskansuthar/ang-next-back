import express from 'express'
import { Topfinish } from '../models/topFinish.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const topFinishList = await Topfinish.find()

        if (!topFinishList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            topFinishes : topFinishList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedTopfinish = await Topfinish.findByIdAndDelete(req.params.id)

    if (!deletedTopfinish) {
        return res.status(404).json({
            message: 'Topfinish not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Topfinish Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "topfinish name is required"
        })
    }

    const topfinish = await Topfinish.findOne({ name });
    if (topfinish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "topfinish already exists"
        })
    }

    const newtopfinish = await Topfinish.create({
        name
    })

    if (!newtopfinish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding topfinish"
        })
    }

    return res.status(201).json(newtopfinish)
})

export default router;   