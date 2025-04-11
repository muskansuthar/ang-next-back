import express from "express";
import multer from "multer";
import { Producttops } from "../models/productTops.js";
import { Product } from "../models/product.js";
import { Top } from "../models/top.js";
import fs from "fs";
import path from 'path';

const router = express.Router();
var imagesArr = [];

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// Upload images
router.post('/upload', upload.array("images"), async (req, res) => {
    try {
        imagesArr = req.files.map(file => file.filename);
        return res.json({ error: false, images: imagesArr });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Image upload failed" });
    }
});

// Get Product Tops by Product ID
router.get("/producttops", async (req, res) => {
    try {
        const { productId } = req.query;
        const top = await Producttops.findOne({ productId }).populate("tops.name");
        if (!top) return res.status(404).json({ error: true, msg: "Product top not found" });
        return res.status(200).json({ error: false, top });
    } catch (error) {
        return res.status(500).json({ error: true, msg: error.message });
    }
});

// Get all Product Tops
router.get('/', async (req, res) => {
    try {
        const productTop = await Producttops.find().populate("tops.name productId");
        if (!productTop.length) return res.status(404).json({ error: true, msg: 'ProductTop not found' });
        return res.status(200).json({ error: false, producttops: productTop });
    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
});

// Create Product Top
router.post('/create', async (req, res) => {
    try {
        const { productId, topId } = req.body;
        if (!productId || !topId) return res.status(400).json({ error: true, msg: "Product ID and Top ID are required" });

        const [productExists, topExists] = await Promise.all([
            Product.findById(productId),
            Top.findById(topId)
        ]);
        if (!productExists) return res.status(404).json({ error: true, msg: "Product not found" });
        if (!topExists) return res.status(404).json({ error: true, msg: "Top not found" });

        let productTop = await Producttops.findOne({ productId });
        if (productTop) {
            if (productTop.tops.some(top => top.name.toString() === topId)) {
                return res.status(400).json({ error: true, msg: "This top is already added to the product" });
            }
            productTop.tops.push({ name: topId, images: imagesArr });
            await productTop.save();
        } else {
            productTop = new Producttops({ productId, tops: [{ name: topId, images: imagesArr }] });
            await productTop.save();
        }
        imagesArr = [];
        return res.status(201).json({ error: false, msg: "Top added successfully", productTop });
    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
});

// Delete Image
router.delete('/deleteImage', async (req, res) => {
    try {
        const imgUrl = req.query.img;
        if (!imgUrl) return res.status(400).json({ error: true, msg: 'Image URL is required' });

        const image = imgUrl.split('/').pop();
        const imagePath = `uploads/${image}`;

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            return res.status(200).json({ error: false, msg: 'Image deleted successfully!' });
        }
        return res.status(404).json({ error: true, msg: 'Image not found!' });
    } catch (error) {
        return res.status(500).json({ error: true, msg: 'Failed to delete the image' });
    }
});

// Delete a Top from a Product
router.delete('/:productId/:topId', async (req, res) => {
    try {
        const { productId, topId } = req.params;
        let productTop = await Producttops.findOne({ productId });
        if (!productTop) return res.status(404).json({ error: true, msg: "Product tops not found" });

        const topIndex = productTop.tops.findIndex(top => top.name.toString() === topId);
        if (topIndex === -1) return res.status(404).json({ error: true, msg: "Top not found in this product" });

        productTop.tops[topIndex].images.forEach(img => {
            const imagePath = `uploads/${img}`;
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });

        productTop.tops.splice(topIndex, 1);
        await productTop.save();
        return res.status(200).json({ error: false, msg: "Top deleted successfully", productTop });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Server Error" });
    }
});

// Delete all Tops for a Product
router.delete('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        let productTop = await Producttops.findOne({ productId });
        if (!productTop) return res.status(404).json({ error: true, msg: "Product tops not found" });

        productTop.tops.forEach(top => {
            top.images.forEach(img => {
                const imagePath = `uploads/${img}`;
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
        });

        await Producttops.findOneAndDelete({ productId });
        return res.status(200).json({ error: false, msg: "All tops deleted for this product" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Server Error" });
    }
});

router.post('/create-with-images', upload.array("images"), async (req, res) => {
    try {
        const { productId, topId } = req.body;
        const files = req.files;

        // Validate inputs
        if (!productId || !topId) {
            return res.status(400).json({ error: true, msg: "Product ID and top ID are required" });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ error: true, msg: "At least one image is required" });
        }

        // Check existence
        const [productExists, topExists] = await Promise.all([
            Product.findById(productId),
            Top.findById(topId)
        ]);

        if (!productExists) {
            return res.status(404).json({ error: true, msg: "Product not found" });
        }
        if (!topExists) {
            return res.status(404).json({ error: true, msg: "Top not found" });
        }

        // Check for duplicates
        let productTop = await Producttops.findOne({ productId });
        if (productTop) {
            const topExists = productTop.tops.some(
                top => top.name.toString() === topId
            );

            if (topExists) {
                // Cleanup uploaded files
                files.forEach(file => {
                    fs.unlinkSync(path.join('uploads', file.filename));
                });
                return res.status(409).json({
                    error: true,
                    msg: "This top already exists for the product"
                });
            }
        }

        // Process files
        const imagePaths = files.map(file => file.filename);
        const newTop = { name: topId, images: imagePaths };

        // Update or create
        if (productTop) {
            productTop.tops.push(newTop);
            await productTop.save();
        } else {
            productTop = new Producttops({
                productId,
                tops: [newTop],
            });
            await productTop.save();
        }


        return res.status(201).json({
            success: true,
            msg: "Top added successfully with images",
            productTop
        });

    } catch (err) {
        // Cleanup on error
        if (req.files?.length) {
            req.files.forEach(file => {
                fs.unlinkSync(path.join('uploads', file.filename));
            });
        }
        return res.status(500).json({
            error: true,
            msg: process.env.NODE_ENV === 'production'
                ? "Server error"
                : err.message
        });
    }
});

export default router;
