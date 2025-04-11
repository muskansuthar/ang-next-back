import mongoose from "mongoose"

const homepageimageSchema = mongoose.Schema({
    images: [{
        type: String, // Image URL or local path
        required: true,
    }]
}, { timestamps: true })


export const Homepageimage = mongoose.model('Homepageimage', homepageimageSchema);