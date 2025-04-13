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
import homepageimageRoutes from './routes/homepageimg.js';
import mobileimageRoutes from './routes/mobileimg.js';
import contactRoutes from './routes/contact.js';

const app = express()     

// app.use(cors())
// app.options('*', cors())

// const allowedOrigins = [
//     "http://localhost:3000", // for local development
//     "http://localhost:3001", // for local development
//     "https://ang-next-front-dqz6.vercel.app", // replace with your deployed Vercel frontend URL
//   ];
  
//   app.use(cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }));

app.use(cors({
  origin: true,  // or '*' but origin: true is better for credentials
  credentials: true
}));
  

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
