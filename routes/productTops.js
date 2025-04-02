import express from "express";
import multer from "multer";
import { Producttops } from "../models/productTops.js";
import { Product } from "../models/product.js";
import { Top } from "../models/top.js";
import fs from "fs";

const router = express.Router()
var imagesArr = [];

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

router.get("/producttops", async (req, res) => {
    try {
        const { productId } = req.query;

        // Find a single document that matches the productId
        const top = await Producttops.findOne({ productId }).populate("tops.name");

        if (!top) {
            return res.status(404).json({ success: false, message: "Product top not found" });
        }

        return res.status(200).json({ top });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}); 

router.get('/', async (req, res) => {
    try {
        const productTop = await Producttops.find().populate("tops.name productId");

        if (!productTop.length) {
            return res.status(404).json({ message: 'ProductTop not found' });
        }

        return res.status(200).json({
            producttops: productTop
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { productId, topId } = req.body;

        // Check if the product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the top exists
        const topExists = await Top.findById(topId);
        if (!topExists) {
            return res.status(404).json({ message: "Top not found" });
        }

        // Check if ProductTop with the same productId already exists
        let productTop = await Producttops.findOne({ productId });

        const newTop = {
            name: topId,
            images: imagesArr, // Store local image path
        };

        if (productTop) {
            // Add new top to existing product
            productTop.tops.push(newTop);
            await productTop.save();
        } else {
            // Create new entry
            productTop = new Producttops({
                productId,
                tops: [newTop],
            });
            await productTop.save();
        }
        imagesArr = []
        return res.status(201).json({ message: "Top added successfully", productTop });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const productTops = await Producttops.findOne({ productId })
            .populate("productId tops.name")

        if (!productTops) {
            return res.status(404).json({ message: "No tops found for this product" });
        }

        res.status(200).json(productTops);
    } catch (err) {
        res.status(500).json({ message: "Server Error", err });
    }
});

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

router.delete('/:productId/:topId', async (req, res) => {
    try {
        const { productId, topId } = req.params;

        let productTop = await Producttops.findOne({ productId });
        if (!productTop) {
            return res.status(404).json({ message: "Product tops not found" });
        }

        const topIndex = productTop.tops.findIndex((top) => top.name.toString() === topId);
        if (topIndex === -1) {
            return res.status(404).json({ message: "Top not found in this product" });
        }

        productTop.tops[topIndex].images.forEach((img) => {
            const imagePath = `uploads/${img}`;
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });

        productTop.tops.splice(topIndex, 1);
        await productTop.save();

        res.status(200).json({ message: "Top deleted successfully", productTop });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.delete("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        let productTop = await Producttops.findOne({ productId });
        if (!productTop) {
            return res.status(404).json({ message: "Product tops not found" });
        }

        // Delete all images from local storage
        productTop.tops.forEach((top) => {
            top.images.forEach((img) => {
                const imagePath = `uploads/${img}`;
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
        });

        await Producttops.findOneAndDelete({ productId });

        res.status(200).json({ message: "All tops deleted for this product" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});


export default router;





// const router = express.Router();

// // Set up Multer for local file storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadPath = "uploads/productTops/";
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({ storage });

// // ✅ CREATE Product Top (Add multiple tops to a product)
// router.post("/create", upload.single("image"), async (req, res) => {
//     try {
//         const { productId, topId } = req.body;
//         if (!productId || !topId || !req.file) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         // Check if the product exists
//         const productExists = await Product.findById(productId);
//         if (!productExists) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // Check if the top exists
//         const topExists = await Top.findById(topId);
//         if (!topExists) {
//             return res.status(404).json({ message: "Top not found" });
//         }

//         // Check if a ProductTop entry exists for this product
//         let productTop = await Producttops.findOne({ productId });

//         const newTop = {
//             name: topId,
//             images: req.file.path, // Store local image path
//         };

//         if (productTop) {
//             // Add new top to existing product
//             productTop.tops.push(newTop);
//             await productTop.save();
//         } else {
//             // Create new entry
//             productTop = new Producttops({
//                 productId,
//                 tops: [newTop],
//             });
//             await productTop.save();
//         }

//         res.status(201).json({ message: "Top added successfully", productTop });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// // ✅ GET All Product Tops
// router.get("/", async (req, res) => {
//     try {
//         const productTops = await Producttops.find()
//             .populate("productId", "name")
//             .populate("tops.name", "name");
//         res.status(200).json(productTops);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// // ✅ GET Product Tops by Product ID
// router.get("/:productId", async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const productTops = await Producttops.findOne({ productId })
//             .populate("productId", "name")
//             .populate("tops.name", "name");

//         if (!productTops) {
//             return res.status(404).json({ message: "No tops found for this product" });
//         }

//         res.status(200).json(productTops);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// // ✅ UPDATE a Product Top (Change image or top name)
// router.put("/:productId/:topId", upload.single("image"), async (req, res) => {
//     try {
//         const { productId, topId } = req.params;
//         const { newTopId } = req.body;
//         let newImagePath = req.file ? req.file.path : null;

//         let productTop = await Producttops.findOne({ productId });
//         if (!productTop) {
//             return res.status(404).json({ message: "Product tops not found" });
//         }

//         const topIndex = productTop.tops.findIndex((top) => top.name.toString() === topId);
//         if (topIndex === -1) {
//             return res.status(404).json({ message: "Top not found in this product" });
//         }

//         if (newTopId) {
//             productTop.tops[topIndex].name = newTopId;
//         }
//         if (newImagePath) {
//             // Delete old image from local storage
//             fs.unlink(productTop.tops[topIndex].images, (err) => {
//                 if (err) console.error("Error deleting old image:", err);
//             });
//             productTop.tops[topIndex].images = newImagePath;
//         }

//         await productTop.save();
//         res.status(200).json({ message: "Top updated successfully", productTop });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// // ✅ DELETE a Specific Top from a Product
// router.delete("/:productId/:topId", async (req, res) => {
//     try {
//         const { productId, topId } = req.params;

//         let productTop = await Producttops.findOne({ productId });
//         if (!productTop) {
//             return res.status(404).json({ message: "Product tops not found" });
//         }

//         const topIndex = productTop.tops.findIndex((top) => top.name.toString() === topId);
//         if (topIndex === -1) {
//             return res.status(404).json({ message: "Top not found in this product" });
//         }

//         // Delete the image from local storage
//         fs.unlink(productTop.tops[topIndex].images, (err) => {
//             if (err) console.error("Error deleting image:", err);
//         });

//         productTop.tops.splice(topIndex, 1);
//         await productTop.save();

//         res.status(200).json({ message: "Top deleted successfully", productTop });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// // ✅ DELETE Entire Product Top Entry (Removes all tops for a product)
// router.delete("/:productId", async (req, res) => {
//     try {
//         const { productId } = req.params;

//         let productTop = await Producttops.findOne({ productId });
//         if (!productTop) {
//             return res.status(404).json({ message: "Product tops not found" });
//         }

//         // Delete all images from local storage
//         productTop.tops.forEach((top) => {
//             fs.unlink(top.images, (err) => {
//                 if (err) console.error("Error deleting image:", err);
//             });
//         });

//         await Producttops.findOneAndDelete({ productId });

//         res.status(200).json({ message: "All tops deleted for this product" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// });

// export default router;