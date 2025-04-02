import express from 'express'
import { Productfinishes } from '../models/productFinishes.js'
import multer from "multer";
import fs from "fs"
import { Product } from "../models/product.js";
import { Finish } from "../models/finish.js";


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

router.get("/productfinishes", async (req, res) => {
    try {
        const { productId } = req.query;

        // Find a single document that matches the productId
        const finish = await Productfinishes.findOne({ productId }).populate("finishes.name");

        if (!finish) {
            return res.status(404).json({ success: false, message: "Product finish not found" });
        }

        return res.status(200).json({ finish });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const productFinish = await Productfinishes.find().populate("finishes.name productId");

        if (!productFinish.length) {
            return res.status(404).json({ message: 'ProductFinish not found' });
        }

        return res.status(200).json({
            productfinishes: productFinish
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { productId, finishId } = req.body;

        // Check if the product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const finishExists = await Finish.findById(finishId);
        if (!finishExists) {
            return res.status(404).json({ message: "Finish not found" });
        }

        let productFinish = await Productfinishes.findOne({ productId });

        const newFinish = {
            name: finishId,
            images: imagesArr, // Store local image path
        };

        if (productFinish) {
            productFinish.finishes.push(newFinish);
            await productFinish.save();
        } else {
            // Create new entry
            productFinish = new Productfinishes({
                productId,
                finishes: [newFinish],
            });
            await productFinish.save();
        }
        imagesArr = []
        return res.status(201).json({ message: "Finish added successfully", productFinish });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const productFinishes = await Productfinishes.findOne({ productId })
            .populate("productId finishes.name")

        if (!productFinishes) {
            return res.status(404).json({ message: "No finishes found for this product" });
        }

        res.status(200).json(productFinishes);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
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

router.delete('/:productId/:finishId', async (req, res) => {
    try {
        const { productId, finishId } = req.params;

        let productFinish = await Productfinishes.findOne({ productId });
        if (!productFinish) {
            return res.status(404).json({ message: "Product Finishes not found" });
        }

        const finishIndex = productFinish.finishes.findIndex((finish) => finish.name.toString() === finishId);
        if (finishIndex === -1) {
            return res.status(404).json({ message: "finish not found in this product" });
        }

        // // Delete the image from local storage
        // fs.unlink(productFinish.finishes[finishIndex].images, (err) => {
        //     if (err) console.error("Error deleting image:", err);
        // });


        productFinish.finishes[finishIndex].images.forEach((img) => {
            const imagePath = `uploads/${img}`;
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });

        productFinish.finishes.splice(finishIndex, 1);
        await productFinish.save();

        res.status(200).json({ message: "Finish deleted successfully", productFinish });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.delete("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        let productFinish = await Productfinishes.findOne({ productId });
        if (!productFinish) {
            return res.status(404).json({ message: "Product finishes not found" });
        }

        // Delete all images from local storage
        // productFinish.finishes.forEach((finish) => {
        //     fs.unlink(finish.images, (err) => {
        //         if (err) console.error("Error deleting image:", err);
        //     });
        // });

        productFinish.finishes.forEach((finish) => {
            finish.images.forEach((img) => {
                const imagePath = `uploads/${img}`;
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
        });

        await Productfinishes.findOneAndDelete({ productId });

        res.status(200).json({ message: "All finishes deleted for this product" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});


export default router;





// router.get('/', async (req, res) => {
//     try {
//         const productFinish = await Productfinishes.find().populate("productId name");
//         if (!productFinish.length) {
//             return res.status(404).json({ message: 'ProductFinish not found' });
//         }
//         return res.status(200).json({
//             productfinishes: productFinish
//         });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// router.post('/create', async (req, res) => {
//     try {
//         const { productId, name } = req.body;

//         const existingProductFinish = await Productfinishes.findOne({ productId, name });
//         if (existingProductFinish) {
//             return res.status(400).json({ message: 'ProductFinish with this name already exists for the given productId' });
//         }

//         const newProductFinish = new Productfinishes(
//             {
//                 productId,
//                 name,
//                 images: imagesArr
//             }
//         );
//         await newProductFinish.save();
//         imagesArr = []
//         return res.status(201).json(newProductFinish);
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

// router.get('/:productId', async (req, res) => {
//     try {
//         const productFinish = await Productfinishes.find({ productId: req.params.productId });
//         if (!productFinish.length) {
//             return res.status(404).json({ message: 'ProductFinish not found for this productId' });
//         }
//         res.json(productFinish);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// router.delete('/deleteImage', async (req, res) => {
//     const imgUrl = req.query.img;

//     if (!imgUrl) {
//         return res.status(400).json({ success: false, msg: 'Image URL is required' });
//     }

//     try {
//         const urlArr = imgUrl.split('/');
//         const image = urlArr[urlArr.length - 1];

//         // Delete the image file from the uploads folder
//         const imagePath = `uploads/${image}`;
//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath);
//         } else {
//             return res.status(404).json({ success: false, msg: 'Image not found!' });
//         }

//         return res.status(200).json({ success: true, msg: 'Image deleted successfully!' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, msg: 'Failed to delete the image' });
//     }
// })

// // router.put('/:id', async (req, res) => {
// //     try {
// //         const updatedProductFinish = await Productfinishes.findByIdAndUpdate(
// //             req.params.id,
// //             req.body,
// //             { new: true }
// //         );
// //         if (!updatedProductFinish) {
// //             return res.status(404).json({ message: 'ProductFinish not found' });
// //         }
// //         res.json(updatedProductFinish);
// //     } catch (err) {
// //         res.status(400).json({ error: err.message });
// //     }
// // });

// router.delete('/:id', async (req, res) => {
//     try {

//         const productfinish = await Productfinishes.findById(req.params.id)
//         const images = productfinish.images;

//         if (images.length !== 0) {
//             for (let image of images) {
//                 fs.unlinkSync(`uploads/${image}`)
//             }
//         }

//         const deletedProductFinish = await Productfinishes.findByIdAndDelete(req.params.id);
//         if (!deletedProductFinish) {
//             return res.status(404).json({ message: 'ProductFinish not found' });
//         }
//         res.json({ message: 'ProductFinish deleted successfully' });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// export default router;   