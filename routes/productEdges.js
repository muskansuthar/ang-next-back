import express from 'express'
import { Productedges } from '../models/productEdges.js'
import multer from "multer";
import fs from "fs"
import { Product } from "../models/product.js";
import { Edge } from "../models/edge.js";

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

router.get("/productedges", async (req, res) => {
    try {
        const { productId } = req.query;

        // Find a single document that matches the productId
        const edge = await Productedges.findOne({ productId }).populate("edges.name");

        if (!edge) {
            return res.status(404).json({ success: false, message: "Product edge not found" });
        }

        return res.status(200).json({ edge });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const productEdgesList = await Productedges.find().populate("edges.name productId");

        if (!productEdgesList.length) {
            return res.status(404).json({ message: 'ProductEdge not found' });
        }

        return res.status(200).json({
            productEdges: productEdgesList
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { productId, edgeId } = req.body;

        // Check if the product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const edgeExists = await Edge.findById(edgeId);
        if (!edgeExists) {
            return res.status(404).json({ message: "Edge not found" });
        }

        let productEdge = await Productedges.findOne({ productId });

        const newEdge = {
            name: edgeId,
            images: imagesArr, // Store local image path
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
        imagesArr = []
        return res.status(201).json({ message: "Edge added successfully", productEdge });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const productEdges = await Productedges.findOne({ productId })
            .populate("productId edges.name")

        if (!productEdges) {
            return res.status(404).json({ message: "No edges found for this product" });
        }

        res.status(200).json(productEdges);
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


export default router;


















// const router = express.Router()
// var imagesArr = [];

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads")
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}_${file.originalname}`)
//     }
// })

// const upload = multer({ storage: storage })

// router.post('/upload', upload.array("images"), async (req, res) => {
//     imagesArr = [];
//     const files = req.files;

//     for (let i = 0; i < files.length; i++) {
//         imagesArr.push(files[i].filename)
//     }

//     return res.json(imagesArr)
// })

// router.get('/', async (req, res) => {
//     try {
//         const productEdgesList = await Productedges.find().populate("productId name")

//         if (!productEdgesList) {
//             return res.status(500).json({ success: false })
//         }
//         return res.status(200).json({
//             productEdges: productEdgesList
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false })
//     }
// })

// // router.post('/create', async (req, res) => {

// //     let productEdge = new Productedges({
// //             edge: req.body.edge,
// //             images: imagesArr,
// //             productId: req.body.productId
// //         })

// //         productEdge = await productEdge.save();

// //         if (!productEdge) {
// //             res.status(500).json({
// //                 error: err,
// //                 success: false
// //             })
// //         }

// //         return res.status(201).json(productEdge)
// // })

// router.post('/create', async (req, res) => {
//     try {
//         const { productId, name } = req.body;

//         const existingProductEdge = await Productedges.findOne({ productId, name });
//         if (existingProductEdge) {
//             return res.status(400).json({ message: 'Productedge with this name already exists for the given productId' });
//         }

//         // If no existing productedge is found, create a new one
//         const newProductEdge = new Productedges(
//             {
//                 productId,
//                 name,
//                 images: imagesArr
//             }
//         );
//         await newProductEdge.save();
//         imagesArr = []
//         return res.status(201).json(newProductEdge);
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

// router.get('/:productId', async (req, res) => {
//     try {
//         const productEdge = await Productedges.find({ productId: req.params.productId });
//         if (!productEdge.length) {
//             return res.status(404).json({ message: 'Productedge not found for this productId' });
//         }
//         res.json(productEdge);
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
// //         const updatedProductEdge = await Productedges.findByIdAndUpdate(
// //             req.params.id,
// //             req.body,
// //             { new: true }
// //         );
// //         if (!updatedProductEdge) {
// //             return res.status(404).json({ message: 'Productedge not found' });
// //         }
// //         res.json(updatedProductEdge);
// //     } catch (err) {
// //         res.status(400).json({ error: err.message });
// //     }
// // });




// // DELETE Productedge


// router.delete('/:id', async (req, res) => {
//     try {
//         const productedge = await Productedges.findById(req.params.id)
//         const images = productedge.images;

//         if (images.length !== 0) {
//             for (let image of images) {
//                 fs.unlinkSync(`uploads/${image}`)
//             }
//         }

//         const deletedProductEdge = await Productedges.findByIdAndDelete(req.params.id);
//         if (!deletedProductEdge) {
//             return res.status(404).json({ message: 'Productedge not found' });
//         }
//         res.json({ message: 'Productedge deleted successfully' });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// export default router;   