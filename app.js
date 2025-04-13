import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors';
import 'dotenv/config';
import authJwt from './helper/jwt.js';

//Routes
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/product.js';
import userRoutes from './routes/user.js';
import searchRoutes from './routes/search.js';
import legFinishRoutes from './routes/legFinish.js';
import legMaterialRoutes from './routes/legMaterial.js';
import topFinishRoutes from './routes/topFinish.js';
import topMaterialRoutes from './routes/topMaterial.js';
import homepageimageRoutes from './routes/homepageimg.js';
import mobileimageRoutes from './routes/mobileimg.js';
import contactRoutes from './routes/contact.js';

const app = express()     

app.use(cors({
  origin: true,  // or '*' but origin: true is better for credentials
  credentials: true
}));
  

//middleware
app.use(bodyParser.json())
app.use(express.json())

app.use(authJwt())

app.use('/api/user', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)  
app.use('/api/search', searchRoutes)
app.use('/api/legfinish', legFinishRoutes)
app.use('/api/legmaterial', legMaterialRoutes)
app.use('/api/topfinish', topFinishRoutes)
app.use('/api/topmaterial', topMaterialRoutes)
app.use('/api/homepageimg', homepageimageRoutes)
app.use('/api/mobileimg', mobileimageRoutes)
app.use('/api/contact', contactRoutes)

//Database
mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log("Database Connection is ready...")  
    //server
    app.listen(process.env.PORT, () => {
        console.log(`Server is running http://localhost:${process.env.PORT}`)
    })
}).catch((err) => {  
    console.log(err) 
})
