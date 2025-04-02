import express from 'express'
import { Legmaterial } from '../models/legMaterial.js'


const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const legmaterialList = await Legmaterial.find()

        if (!legmaterialList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            legMaterials : legmaterialList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.delete('/:id', async (req, res) => {

    const deletedLegmaterial = await Legmaterial.findByIdAndDelete(req.params.id)

    if (!deletedLegmaterial) {
        return res.status(404).json({
            message: 'Legmaterial not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Legmaterial Deleted!'
    })
})

router.post('/create', async (req, res) => {

    const { name } = req.body

    if (!name) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "legmaterial name is required"
        })
    }

    const legmaterial = await Legmaterial.findOne({ name });
    if (legmaterial) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "legmaterial already exists"
        })
    }

    const newlegmaterial = await Legmaterial.create({
        name
    })

    if (!newlegmaterial) {
        return res.status(500).json({
            error: error,
            success: false,
            msg: "Something went wrong while adding legmaterial"
        })
    }

    return res.status(201).json(newlegmaterial)
})

export default router;   