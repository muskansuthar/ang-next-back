import express from 'express'
import { Legfinish } from '../models/legFinish.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const legFinishList = await Legfinish.find()

        if (!legFinishList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            legFinishes : legFinishList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedLegfinish = await Legfinish.findByIdAndDelete(req.params.id)

    if (!deletedLegfinish) {
        return res.status(404).json({
            message: 'Legfinish not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Legfinish Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "legfinish name is required"
        })
    }

    const legfinish = await Legfinish.findOne({ name });
    if (legfinish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "legfinish already exists"
        })
    }

    const newlegfinish = await Legfinish.create({
        name
    })

    if (!newlegfinish) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding legfinish"
        })
    }

    return res.status(201).json(newlegfinish)
})

export default router;   