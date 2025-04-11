import mongoose from "mongoose"

const mobileimageSchema = mongoose.Schema({
    images: [{
        type: String, // Image URL or local path
        required: true,
    }]
}, { timestamps: true })


export const Mobileimage = mongoose.model('Mobileimage', mobileimageSchema);