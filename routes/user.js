import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express from 'express'
import { User } from '../models/user.js'
import multer from "multer";
import fs from "fs"


const router = express.Router()

var imagesArr = [];
var categoryEditId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {

    if (categoryEditId !== undefined) {
        const category = await Category.findById(categoryEditId)
        const images = category.images

        if (images.length !== 0) {
            for (let image of images) {
                fs.unlinkSync(`uploads/${image}`)
            }
        }
    }
    imagesArr = [];
    const files = req.files;

    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename)
    }

    return res.json(imagesArr)
})


router.post('/signup', async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {
        const existingUser = await User.findOne({ email: email })
        const existingUserByPh = await User.findOne({ phone: phone })

        if (existingUser || existingUserByPh) {
            return res.status(400).json({ error: true, msg: "user already exist!" })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const result = await User.create({
            name: name,
            phone: phone,
            email: email,
            password: hashPassword,
            isAdmin: isAdmin
        })

        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY)

        return res.status(200).json({
            user: result,
            error: false,
            token: token
        })
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Something went wrong" })
    }
})


router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email })
        if (!existingUser) {
            return res.status(404).json({ error: true, msg: "User not found!" })
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password)

        if (!matchPassword) {
            return res.status(400).json({ error: true, msg: "Invalid credentials" })
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY)

        return res.status(200).json({
            user: existingUser,
            token: token,
            error: false,
            msg: "User Authenticated"
        })
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Something went wrong" })
    }
})

router.post('/authWithGoogle', async (req, res) => {
    const { name, phone, email, password, images, isAdmin } = req.body;

    try {
        const existingUser = await User.findOne({ email: email })

        if (!existingUser) {
            const result = await User.create({
                name: name,
                phone: phone,
                email: email,
                password: password,
                images:images,
                isAdmin: isAdmin
            })
            
            const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY)
            
            return res.status(200).json({
            user: result,
            error: false,
            token: token,
            msg:"User Login Successfully!"
        })
    }else{
        const existingUser = await User.findOne({ email: email })
        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY)
        return res.status(200).json({
            user: existingUser,
            error: false,
            token: token,
            msg:"User Login Successfully!"
        })
    }
    } catch (error) {
        return res.status(500).json({ error: true, msg: "Something went wrong" })
    }
})

router.get('/', async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        return res.status(500).json({ success: false })
    }
    return res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ massage: "The user with the given ID was not found." })
    }
    return res.status(200).send(user)
})

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, massage: "The user with the given ID was not found." })
        }

        return res.status(200).json({ success: true, massage: "The user is deleted!." })
    } catch (err) {
        return res.status(500).json({ success: false, error: err })
    }
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments()

    if (!userCount) {
        return res.status(500).json({ success: false })
    }
    return res.send({
        userCount: userCount
    })
})

router.put('/:id', async (req, res) => {
    const { name, phone, email } = req.body

    const userExist = await User.findById(req.params.id)

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: name,
            phone: phone,
            email: email,
            images: imagesArr
        },
        { new: true }
    )

    if (!user) {
        return res.status(400).send("the user cannot be updated!")
    }

    return res.send(user)
})

router.put('/changePassword/:id', async (req, res) => {
    const { name, phone, email, password, newPass, images } = req.body

    const existingUser = await User.findOne({ email: email })
    if (!existingUser) {
        return res.status(404).json({ error: true, msg: "User not found!" })
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password)

    if (!matchPassword) {
        return res.status(400).json({ error: true, msg: "Invalid password" })
    }else{
        let newPassword
    
        if (newPass) {  
            newPassword = bcrypt.hashSync(newPass, 10)
        } else {
            newPassword = existingUser.password
        }
    
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                phone: phone,
                email: email,
                password: newPassword,
                images: images,
            },
            { new: true }
        )
    
        if (!user) {
            return res.status(400).send("the user cannot be updated!")
        }
    
        return res.send(user)
    }

})
// router.put('/:id', async (req, res) => {
//     const { name, phone, email, password, isAdmin } = req.body

//     const userExist = await User.findById(req.params.id)
//     let newPassword
//     if (password) {
//         newPassword = bcrypt.hashSync(password, 10)
//     } else {
//         newPassword = userExist.password
//     }

//     const user = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: name,
//             phone: phone,
//             email: email,
//             password: newPassword,
//             isAdmin: isAdmin
//         },
//         { new: true }
//     )

//     if (!user) {
//         return res.status(400).send("the user cannot be updated!")
//     }

//     return res.send(user)
// })

export default router;  