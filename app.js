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
import edgeRoutes from './routes/edge.js';
import finishRoutes from './routes/finish.js';
import legFinishRoutes from './routes/legFinish.js';
import legMaterialRoutes from './routes/legMaterial.js';
import productEdgeRoutes from './routes/productEdges.js';
import productFinishRoutes from './routes/productFinishes.js';
import productTopRoutes from './routes/productTops.js';
import topRoutes from './routes/top.js';
import topFinishRoutes from './routes/topFinish.js';
import topMaterialRoutes from './routes/topMaterial.js';

const app = express()     

app.use(cors())
app.options('*', cors())

//middleware
app.use(bodyParser.json())
app.use(express.json())
app.use(authJwt())

app.use('/uploads', express.static("uploads"))
app.use('/api/user', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)  
app.use('/api/search', searchRoutes)
app.use('/api/edge', edgeRoutes)
app.use('/api/finish', finishRoutes)
app.use('/api/legfinish', legFinishRoutes)
app.use('/api/legmaterial', legMaterialRoutes)
app.use('/api/productedge', productEdgeRoutes)
app.use('/api/productfinish', productFinishRoutes)
app.use('/api/producttop', productTopRoutes)
app.use('/api/top', topRoutes)
app.use('/api/topfinish', topFinishRoutes)
app.use('/api/topmaterial', topMaterialRoutes)

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
