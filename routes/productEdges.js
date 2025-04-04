import express from 'express';
import { Productedges } from '../models/productEdges.js';
import multer from "multer";
import fs from "fs";
import { Product } from "../models/product.js";
import { Edge } from "../models/edge.js";

const router = express.Router();
var imagesArr = [];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.array("images"), async (req, res) => {
    try {
        imagesArr = req.files.map(file => file.filename);
        return res.json(imagesArr);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Image upload failed" });
    }
});

router.get("/productedges", async (req, res) => {
    try {
        const { productId } = req.query;
        const edge = await Productedges.findOne({ productId }).populate("edges.name");
        if (!edge) {
            return res.status(404).json({ error: true, msg: "Product edge not found" });
        }
        return res.status(200).json({ edge });
    } catch (error) {
        return res.status(500).json({ error: true, msg: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const productEdgesList = await Productedges.find().populate("edges.name productId");
        if (!productEdgesList.length) {
            return res.status(404).json({ error: true, msg: 'ProductEdge not found' });
        }
        return res.status(200).json({ productEdges: productEdgesList });
    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { productId, edgeId } = req.body;

        // Check if the product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ error: true, msg: "Product not found" });
        }

        // Check if the edge exists
        const edgeExists = await Edge.findById(edgeId);
        if (!edgeExists) {
            return res.status(404).json({ error: true, msg: "Edge not found" });
        }

        let productEdge = await Productedges.findOne({ productId });

        if (productEdge) {
            // Check if the edgeId already exists in the edges array
            const isEdgeAlreadyAdded = productEdge.edges.some(edge => edge.name.toString() === edgeId);

            if (isEdgeAlreadyAdded) {
                return res.status(400).json({ error: true, msg: "This edge is already added to the product" });
            }

            // Add new edge
            productEdge.edges.push({
                name: edgeId,
                images: imagesArr, // Store local image path
            });

            await productEdge.save();
        } else {
            // Create a new entry if the product doesn't exist in Productedges
            productEdge = new Productedges({
                productId,
                edges: [{ name: edgeId, images: imagesArr }],
            });

            await productEdge.save();
        }

        imagesArr = []; // Reset images array
        return res.status(201).json({ message: "Edge added successfully", productEdge });

    } catch (err) {
        return res.status(500).json({ error: true, msg: err.message });
    }
});


router.delete('/deleteImage', async (req, res) => {
    try {
        const imgUrl = req.query.img;
        if (!imgUrl) {
            return res.status(400).json({ error: true, msg: 'Image URL is required' });
        }
        const imagePath = `uploads/${imgUrl.split('/').pop()}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            return res.status(200).json({ msg: 'Image deleted successfully!' });
        }
        return res.status(404).json({ error: true, msg: 'Image not found!' });
    } catch (error) {
        return res.status(500).json({ error: true, msg: 'Failed to delete the image' });
    }
});

export default router;
