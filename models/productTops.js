import mongoose from "mongoose";

const productTopSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        tops: [
            {
                name: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Top",
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
    },
    { timestamps: true }
);

export const Producttops = mongoose.model("Producttops", productTopSchema);
