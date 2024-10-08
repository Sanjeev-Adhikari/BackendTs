import * as dotenv from 'dotenv'
dotenv.config()

import express,{Application, Request, Response} from 'express'
import './database/connection'
import userRoute from './routes/userRoute'
import productRoute from './routes/productRoute'
import categoryRoute from './routes/categoryRoute' 
import cartRoute from './routes/cartRoute'
import orderRoute from './routes/orderRoute'
import adminSeeder from './adminSeeder'
import categoryController from './controllers/categoryController'

import cors from 'cors'


const app:Application = express()
const PORT:number = 3000

//setting cors to connect frontend and backend
app.use(cors({
    origin : "*"
}))
// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//admin seeder
adminSeeder()
app.use(express.static("./src/uploads/"))

//Routes
app.use("", userRoute)
app.use("/product", productRoute)
app.use("/admin/category", categoryRoute)
app.use("/customer/cart", cartRoute)
app.use("/order", orderRoute)


app.listen(PORT,()=>{
    categoryController.seedCategory()
    console.log("Server is started at port:" +PORT)
})