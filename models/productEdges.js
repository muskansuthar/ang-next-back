import mongoose from "mongoose"

const productEdgeSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    edges: [
        {
            name: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Edge",
                required: true,
            },
            images: [
                {
                    type: String, // Image URL or local path
                    required: true,
                },
            ],
        },
    ],
}, { timestamps: true })

export const Productedges = mongoose.model('Productedges', productEdgeSchema);