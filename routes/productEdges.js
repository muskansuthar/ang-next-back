import express from 'express';
import { Productedges } from '../models/productEdges.js';
import multer from "multer";
import fs from "fs";
import { Product } from "../models/product.js";
import { Edge } from "../models/edge.js";
import path from 'path';

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


router.delete('/:productId/:edgeId', async (req, res) => {
    try {
        const { productId, edgeId } = req.params;

        let productEdge = await Productedges.findOne({ productId });
        if (!productEdge) {
            return res.status(404).json({ message: "Product edges not found" });
        }

        const edgeIndex = productEdge.edges.findIndex((edge) => edge.name.toString() === edgeId);
        if (edgeIndex === -1) {
            return res.status(404).json({ message: "edge not found in this product" });
        }

        productEdge.edges[edgeIndex].images.forEach((img) => {
            const imagePath = `uploads/${img}`;
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });

        productEdge.edges.splice(edgeIndex, 1);
        await productEdge.save();

        res.status(200).json({ message: "Edge deleted successfully", productEdge });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.delete("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        let productEdge = await Productedges.findOne({ productId });
        if (!productEdge) {
            return res.status(404).json({ message: "Product edges not found" });
        }

        productEdge.edges.forEach((edge) => {
            edge.images.forEach((img) => {
                const imagePath = `uploads/${img}`;
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
        });

        await Productedges.findOneAndDelete({ productId });

        res.status(200).json({ message: "All edges deleted for this product" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/create-with-images', upload.array("images"), async (req, res) => {
    try {
        const { productId, edgeId } = req.body;
        const files = req.files;

        // Check if the product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ error: true, msg: "Product not found" });
        }

        const edgeExists = await Edge.findById(edgeId);
        if (!edgeExists) {
            return res.status(404).json({ error: true, msg: "Edge not found" });
        }

        let productEdge = await Productedges.findOne({ productId });
        if (productEdge) {
            const edgeExists = productEdge.edges.some(edge => edge.name.toString() === edgeId);
            if (edgeExists) {
                // If duplicate found, remove any uploaded files
                if (files && files.length > 0) {
                    files.forEach(file => {
                        try {
                            fs.unlinkSync(path.join('uploads', file.filename));
                        } catch (err) {
                            console.error('Error deleting uploaded file:', err);
                        }
                    });
                }
                return res.status(409).json({ error: true, msg: "This edge already exists for the product" });
            }
        }

        // Get image filenames
        const imagePaths = files.map(file => file.filename);
        const newEdge = {
            name: edgeId,
            images: imagePaths,
        };

        if (productEdge) {
            productEdge.edges.push(newEdge);
            await productEdge.save();
        } else {
            // Create new entry
            productEdge = new Productedges({
                productId,
                edges: [newEdge],
            });
            await productEdge.save();
        }

        return res.status(201).json({
            message: "Edge added successfully with images",
            productEdge
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post('/create-with-images', upload.array("images"), async (req, res) => {
    try {
        const { productId, edgeId } = req.body;
        const files = req.files;

        // Validate inputs
        if (!productId || !edgeId) {
            return res.status(400).json({
                error: true,
                msg: "Product ID and Edge ID are required"
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: true,
                msg: "At least one image is required"
            });
        }

        // Check if the product and edge exist in parallel
        const [productExists, edgeExists] = await Promise.all([
            Product.findById(productId),
            Edge.findById(edgeId)
        ]);

        if (!productExists) {
            return res.status(404).json({
                error: true,
                msg: "Product not found"
            });
        }

        if (!edgeExists) {
            return res.status(404).json({
                error: true,
                msg: "Edge not found"
            });
        }

        // Check for existing product edge
        let productEdge = await Productedges.findOne({ productId });

        if (productEdge) {
            const edgeExists = productEdge.edges.some(
                edge => edge.name.toString() === edgeId
            );

            if (edgeExists) {
                // Cleanup uploaded files
                files.forEach(file => {
                    fs.unlinkSync(path.join('uploads', file.filename));
                });
                return res.status(409).json({
                    error: true,
                    msg: "This Edge already exists for the product"
                });
            }
        }


        const imagePaths = files.map(file => file.filename);
        const newEdge = { name: edgeId, images: imagePaths };


        // Update or create product edge
        if (productEdge) {
            productEdge.edges.push(newEdge);
            await productEdge.save();
        } else {
            productEdge = new Productedges({
                productId,
                edges: [newEdge],
            });
            await productEdge.save();
        }


        return res.status(201).json({
            success: true,
            msg: "Edge added successfully with images",
            productEdge
        });

    } catch (err) {
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
