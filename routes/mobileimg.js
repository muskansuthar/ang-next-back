import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Mobileimage } from "../models/mobileimg.js";

const router = express.Router();

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
        const image = new Mobileimage({ images: imagePaths });
        await image.save();

        res.status(201).json({ error: false, msg: "Images uploaded", data: image });
    } catch (err) {
        res.status(500).json({ error: true, msg: "Failed to upload images" });
    }
});

router.get("/", async (req, res) => {
    try {
        const images = await Mobileimage.find()

        if (images.length === 0) {
            return res.status(404).json({ error: true, msg: "No Mobile images found" });
        }

        res.status(200).json({ error: false, data: images });
    } catch (err) {
        res.status(500).json({ error: true, msg: "Failed to fetch images" });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const mobileimg = await Mobileimage.findById(req.params.id);

    if (!mobileimg) {
      return res.status(404).json({ error: true, msg: "The mobile image with the given ID was not found" });
    }

    return res.status(200).json(mobileimg);
  } catch (error) {
    return res.status(500).json({ error: true, msg: "An error occurred while fetching the mobile image", details: error.message });
  }
});

router.put("/:id", upload.array("images"), async (req, res) => {
    try {
        
        const files = req.files; 

        if (!files || files.length === 0) {
            return res.status(400).json({ error: true, msg: "No image files provided" });
        }
        const imageDoc = await Mobileimage.findById(req.params.id);

        if (!imageDoc) {
            return res.status(404).json({ error: true, msg: "Image document not found" });
        }

        if(imageDoc.images.length > 0) {
            imageDoc.images.forEach(filename => {
              const filePath = path.join("uploads", filename);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            });
          }

          const newImagePaths = files.map(file => file.filename);

        const updatedImage = await Mobileimage.findByIdAndUpdate(
            req.params.id,
            { images: newImagePaths },
            { new: true }
        );

        res.status(200).json({ error: false, msg: "Images updated", data: updatedImage });
    } catch (err) {
        res.status(500).json({ error: true, msg: "Failed to update images" });
    }
});

export default router;