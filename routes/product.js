import express from 'express'
import { Category } from '../models/category.js';
import { Product } from '../models/product.js';
import { Legfinish } from '../models/legFinish.js'
import { Legmaterial } from '../models/legMaterial.js'
import { Topfinish } from '../models/topFinish.js'
import { Topmaterial } from '../models/topMaterial.js'
import multer from "multer";
import fs from "fs"


const router = express.Router()

var imagesArr = [];
var productEditId;

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

    if (productEditId !== undefined) {
        const product = await Product.findById(productEditId)
        const images = product.images

        if (images.length !== 0) {
            for (let image of images) {
                fs.unlinkSync(`uploads/${image}`)
            }
        }
    }
    imagesArr = [];
    const files = req.files;

    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename)
    }

    return res.json(imagesArr)
})

router.get('/featured', async (req, res) => {

    const productList = await Product.find({ isFeatured: true })

    if (!productList) {
        return res.status(500).json({ success: false })
    }

    return res.status(200).json(productList);
})

router.get('/filter', async (req, res) => {
    try {
      let query = {};
  
      // If category is provided, filter by it
      if (req.query.category) {
        const category = await Category.findOne({ name: req.query.category });
        if (category) {
          query.category = category._id;
        }
      }

      // Add other filters
      if (req.query.topmaterial) query.topmaterial = req.query.topmaterial;
      if (req.query.legmaterial) query.legmaterial = req.query.legmaterial;
      if (req.query.topfinish) query.topfinish = req.query.topfinish;
      if (req.query.legfinish) query.legfinish = req.query.legfinish;

      
      const productList = await Product.find(query).populate("category legfinish legmaterial topfinish topmaterial");
  
      return res.status(200).json({ products: productList });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/category', async (req, res) => {
    try {
        const categoryId = req.query.category; // Get the category value from the query string

        if (!categoryId) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        // Find products that match the category
        const productList = await Product.find({ category: categoryId }).populate("category legfinish legmaterial topfinish topmaterial");

        return res.status(200).json({ products: productList });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message }); 
    }
});



router.get('/', async (req, res) => {
    try {
        const productList = await Product.find().populate("category legfinish legmaterial topfinish topmaterial")

        if (!productList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            products: productList
        });

    } catch (error) {
        return res.status(500).json({ success: false })
    }
})

router.post('/create', async (req, res) => {

    const { category, legfinish, legmaterial, topfinish, topmaterial } = req.body;

    const categoryId = await Category.findById(category)
    if (!categoryId) {
        return res.status(404).send("Invalid Category!")
    }
    const legfinishId = await Legfinish.findById(legfinish)
    if (!legfinishId) {
        return res.status(404).send("Invalid legfinish!")
    }
    const legmaterialId = await Legmaterial.findById(legmaterial)
    if (!legmaterialId) {
        return res.status(404).send("Invalid legmaterial!")
    }

    const topfinishId = topfinish?.trim() ? topfinish : null;
    const topmaterialId = topmaterial?.trim() ? topmaterial : null;


    if(topfinishId){
        const topfinishD = await Topfinish.findById(topfinishId)
        if (!topfinishD) {
            return res.status(404).send("Invalid topfinish!")
        }
    }

    if(topmaterialId){
        const topmaterialD = await Topmaterial.findById(topmaterialId)
        if (!topmaterialD) {
            return res.status(404).send("Invalid topmaterial!")
        }
    }

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        images: imagesArr,
        price: req.body.price,
        category: category,
        legfinish: legfinish,
        legmaterial: legmaterial,
        topfinish: topfinishId,
        topmaterial: topmaterialId,
        height: req.body.height,
        width: req.body.width,
        length: req.body.length,
        weight: req.body.weight,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();

    if (!product) {
        res.status(500).json({
            error: err,
            success: false
        })
    }

    return res.status(201).json(product)
})


router.get('/:id', async (req, res) => {

    productEditId = req.params.id;
    const product = await Product.findById(req.params.id).populate("category legfinish legmaterial topfinish topmaterial")

    if (!product) {
        return res.status(500).json({ message: 'The product with the given ID was not found' })
    }

    return res.status(200).send(product)
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

    const product = await Product.findById(req.params.id)
    const images = product.images;

    if (images.length !== 0) {
        for (let image of images) {
            fs.unlinkSync(`uploads/${image}`)
        }
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
        res.status(404).json({
            message: 'Product not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Product Deleted!'
    })
})

router.put('/:id', async (req, res) => {

    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.status(404).send("Invalid Category!")
    }
    const legfinish = await Legfinish.findById(req.body.legfinish)
    if (!legfinish) {
        return res.status(404).send("Invalid legfinish!")
    }
    const legmaterial = await Legmaterial.findById(req.body.legmaterial)
    if (!legmaterial) {
        return res.status(404).send("Invalid legmaterial!")
    }
    const topfinish = await Topfinish.findById(req.body.topfinish)
    if (!topfinish) {
        return res.status(404).send("Invalid topfinish!")
    }
    const topmaterial = await Topmaterial.findById(req.body.topmaterial)
    if (!topmaterial) {
        return res.status(404).send("Invalid topmaterial!")
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            images: imagesArr,
            price: req.body.price,
            category: req.body.category,
            legfinish: req.body.legfinish,
            legmaterial: req.body.legmaterial,
            topfinish: req.body.topfinish,
            topmaterial: req.body.topmaterial,
            height: req.body.height,
            width: req.body.width,
            length: req.body.length,
            weight: req.body.weight,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )

    if (!product) {
        return res.status(500).json({
            message: 'Product cannot be updated',
            success: false
        })
    }

    return res.send(product);
})



export default router;      