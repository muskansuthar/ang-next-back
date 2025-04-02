import mongoose from "mongoose"

const topMaterialSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Topmaterial = mongoose.model('Topmaterial', topMaterialSchema);