import express from 'express'
import { Category } from '../models/category.js';
import multer from "multer";
import fs from "fs"


const router = express.Router()

var imagesArr = [];
// var categoryEditId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {

    imagesArr = [];
    const files = req.files;

    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename)
    }

    return res.json(imagesArr)
})

router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find()

        if (!categoryList) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json({
            categoryList : categoryList
        })

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.get('/:id', async (req, res) => {

    // categoryEditId = req.params.id;

    const category = await Category.findById(req.params.id)

    if (!category) {
        return res.status(500).json({ message: 'The category with the given ID was not found' })
    }

    return res.status(200).send(category)
})


router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

    if (!imgUrl) {
        return res.status(400).json({ success: false, msg: 'Image URL is required' });
    }

    try {
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];

        // Delete the image file from the uploads folder
        const imagePath = `uploads/${image}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        } else {
            return res.status(404).json({ success: false, msg: 'Image not found!' });
        }

        return res.status(200).json({ success: true, msg: 'Image deleted successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Failed to delete the image' });
    }
})

router.delete('/:id', async (req, res) => {

    const category = await Category.findById(req.params.id)
    const images = category.images;

    if (images.length !== 0) {
        for (let image of images) {
            fs.unlinkSync(`uploads/${image}`)
        }
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id)

    if (!deletedCategory) {
        return res.status(404).json({
            message: 'Category not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Category Deleted!'
    })
})

router.post('/create', async (req, res) => {
    let catObj = {}
    if (imagesArr.length > 0) {
        catObj = {
            name: req.body.name,
            slug: req.body.slug,
            images: imagesArr
        }
    } else {
        catObj = {
            name: req.body.name,
            slug: req.body.slug,
        }
    }

    let category = new Category(catObj)

    if (!category) {
        res.status(500).json({
            error: error,
            success: false
        })
    }

    category = await category.save()

    imagesArr = []

    return res.status(201).json(category);
})

// router.put('/:id', async (req, res) => {

//     const category = await Category.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             images: imagesArr
//         },
//         { new: true }
//     )

//     if (!category) {
//         return res.status(500).json({
//             message: 'Category cannot be updated',
//             success: false
//         })
//     }

//     return res.send(category);
// })

export default router;     