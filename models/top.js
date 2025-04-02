import mongoose from "mongoose"

const topSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Top = mongoose.model('Top', topSchema);