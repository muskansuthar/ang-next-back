import mongoose from "mongoose"

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    legfinish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Legfinish',
        required: true
    },
    legmaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Legmaterial',
        required: true
    },
    topfinish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topfinish'
    },
    topmaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topmaterial'
    },
    height: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    width: {
        type: String,
        required: true
    },
    cbm: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


export const Product = mongoose.model('Product', productSchema);

