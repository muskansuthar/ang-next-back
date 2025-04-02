import mongoose from "mongoose"

const productFinishSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    finishes: [
        {
            name: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Finish",
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

export const Productfinishes = mongoose.model('Productfinishes', productFinishSchema);