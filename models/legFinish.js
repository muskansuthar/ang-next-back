import mongoose from "mongoose"

const legFinishSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Legfinish = mongoose.model('Legfinish', legFinishSchema);