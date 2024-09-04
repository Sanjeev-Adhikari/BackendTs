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

const app:Application = express()
const PORT:number = 3000
// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//admin seeder
adminSeeder()

//Routes
app.use("", userRoute)
app.use("/admin/product", productRoute)
app.use("/admin/category", categoryRoute)
app.use("/customer/cart", cartRoute)
app.use("/order", orderRoute)


app.listen(PORT,()=>{
    categoryController.seedCategory()
    console.log("Server is started at port:" +PORT)
})