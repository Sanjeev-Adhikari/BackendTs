import * as dotenv from 'dotenv'
dotenv.config()

import express,{Application, Request, Response} from 'express'
import './database/connection'
import userRoute from './routes/userRoute'

const app:Application = express()
const PORT:number = 3000
// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("", userRoute)

app.listen(PORT,()=>{
    console.log("Server is started at port:" +PORT)
})