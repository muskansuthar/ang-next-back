import express from 'express'
import { Topmaterial } from '../models/topMaterial.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const topmaterialList = await Topmaterial.find()

        if (!topmaterialList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            topMaterials : topmaterialList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedTopmaterial = await Topmaterial.findByIdAndDelete(req.params.id)

    if (!deletedTopmaterial) {
        return res.status(404).json({
            message: 'Topmaterial not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Topmaterial Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "topmaterial name is required"
        })
    }

    const topmaterial = await Topmaterial.findOne({ name });
    if (topmaterial) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "topmaterial already exists"
        })
    }

    const newtopmaterial = await Topmaterial.create({
        name
    })

    if (!newtopmaterial) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding topmaterial"
        })
    }

    return res.status(201).json(newtopmaterial)
})

export default router;   