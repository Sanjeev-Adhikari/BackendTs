import { Request, Response } from "express";
import User from "../database/models/User";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



class AuthController{
    public static async registerUser(req:Request, res:Response):Promise<void>{
        //Take input
        const {username, email, password, role} = req.body
        //validate input
        if(!username || !email || !password){
             res.status(400).json({
                message: "Please fill the required fields"
            })
            return
        } 

        //check if the user is already registered with the given email
         const [userFound] = await User.findAll({
            where : {
                email : email
            }
         })
         if(userFound){
            res.status(401).json({
                message : "user with that email registered already"
            })
            return
         }  

        //create a new user
        await User.create({
            username,
            email,
            password : bcrypt.hashSync(password, 10),
            role : role
        })

        res.status(200).json({
            message : "User registered successfully"
        })
    }

    public static async loginUser(req:Request, res:Response): Promise<void>{
        //take input
        const {email,password} = req.body
        //Validate input
        if(!email || !password){
            res.status(400).json({
                message : "Please provide email and password"
            })
            return
        }
        //Check if a user with the input email exists
        const [data] = await User.findAll({
            where : {
                email : email
            }
        })
        //if email is not found
        if(!data){
            res.status(400).json({
                message : "No user found with that email"
            })
            return
        }
        //check if the password is correct or not
        const isMatched = bcrypt.compareSync(password, data.password)
        if(!isMatched){
            res.status(403).json({
                message : "Invalid Email or Password"
            })
            return
        }
        //generate token
        const token = jwt.sign({id:data.id}, process.env.SECRET_KEY as string, {
            expiresIn: "20d"
        }
        )
        res.status(200).json({
            message : "User Logged in successfully",
            data : token
        })  
    }
}

export default AuthController
