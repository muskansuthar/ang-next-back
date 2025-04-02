import mongoose from "mongoose"

const edgeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Edge = mongoose.model('Edge', edgeSchema);