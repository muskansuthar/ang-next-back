import mongoose from "mongoose"

const legMaterialSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Legmaterial = mongoose.model('Legmaterial', legMaterialSchema);