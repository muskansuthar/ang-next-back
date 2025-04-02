import express from 'express'
import { Finish } from '../models/finish.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const finishList = await Finish.find()

        if (!finishList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            finishes: finishList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedFinish = await Finish.findByIdAndDelete(req.params.id)

    if (!deletedFinish) {
        return res.status(404).json({
            message: 'Finish not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Finish Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "finish name is required"
        })
    }

    const finish = await Finish.findOne({ name });
    if (finish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "finish already exists"
        })
    }

    const newfinish = await Finish.create({
        name
    })

    if (!newfinish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding finish"
        })
    }

    return res.status(201).json(newfinish)
})

export default router;   