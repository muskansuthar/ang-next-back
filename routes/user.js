import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express from 'express'
import { User } from '../models/user.js'


const router = express.Router()

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

export default router;  