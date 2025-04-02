import mongoose from "mongoose"

const finishSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true }) 


export const Finish = mongoose.model('Finish', finishSchema);