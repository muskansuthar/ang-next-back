import express from "express";
import multer from "multer";
import fs from "fs";
import { Homepageimage } from "../models/homepageimg.js";
import path from "path";

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

router.post("/create", upload.array("images"), async (req, res) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: true, msg: "No image files provided" });
        }

        const imagePaths = files.map(file => file.filename);
        const image = new Homepageimage({ images: imagePaths });
        await image.save();

        res.status(201).json({ error: false, msg: "Images uploaded", data: image });
    } catch (err) {
        if (req.files?.length) {
            req.files.forEach(file => {
                fs.unlinkSync(path.join('uploads', file.filename));
            });
        }
        res.status(500).json({ error: true, msg: "Failed to upload images" });
    }
});

router.get("/", async (req, res) => {
    try {
        const images = await Homepageimage.find()

        if (images.length === 0) {
            return res.status(404).json({ error: true, msg: "No homepage images found" });
        }

        res.status(200).json({ error: false, data: images });
    } catch (err) {
        res.status(500).json({ error: true, msg: "Failed to fetch images" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const homepageimg = await Homepageimage.findById(req.params.id);

        if (!homepageimg) {
            return res.status(404).json({ error: true, msg: "The home page image with the given ID was not found" });
        }

        return res.status(200).json(homepageimg);
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while fetching the home page image", details: error.message });
    }
});

router.put("/:id", upload.array("images"), async (req, res) => {
    try {

        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: true, msg: "No image files provided" });
        }
        const imageDoc = await Homepageimage.findById(req.params.id);

        if (!imageDoc) {
            return res.status(404).json({ error: true, msg: "Image document not found" });
        }

        if (imageDoc.images.length > 0) {
            imageDoc.images.forEach(filename => {
                const filePath = path.join("uploads", filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        const newImagePaths = files.map(file => file.filename);

        const updatedImage = await Homepageimage.findByIdAndUpdate(
            req.params.id,
            { images: newImagePaths },
            { new: true }
        );

        res.status(200).json({ error: false, msg: "Images updated", data: updatedImage });
    } catch (err) {
        res.status(500).json({ error: true, msg: "Failed to update images" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const homepageimage = await Homepageimage.findById(req.params.id)
        const images = homepageimage.images;

        if (images.length !== 0) {
            for (let image of images) {
                fs.unlinkSync(`uploads/${image}`)
            }
        }
        const deletedHomepageimage = await Homepageimage.findByIdAndDelete(req.params.id);

        if (!deletedHomepageimage) {
            return res.status(404).json({ error: true, msg: "Homepageimage not found!" });
        }

        return res.status(200).json({ success: true, msg: "Homepageimage Deleted!" });
    } catch (error) {
        return res.status(500).json({ error: true, msg: "An error occurred while deleting the homepageimage", details: error.message });
    }
});


export default router;
