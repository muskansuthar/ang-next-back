import mongoose from "mongoose"

const topFinishSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Topfinish = mongoose.model('Topfinish', topFinishSchema);