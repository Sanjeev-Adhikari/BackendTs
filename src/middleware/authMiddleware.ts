import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import User from "../database/models/User";

export interface AuthRequest extends Request{
    user?:{
        username : string,
        email : string,
        role : string,
        password : string,
        id : string
    }    
}

export enum Role{
    Admin = 'admin',
    Customer = 'customer'
}

class AuthMiddleware{
    async isAuthenticated(req:AuthRequest, res:Response, next:NextFunction):Promise<void>{
        //get token from user
        const token = req.headers.authorization
        if(!token || token === undefined){
            res.status(403).json({
                message : "Please provide a token"
            })
        return
        }
        //verify if the given token is legit or tempered
        jwt.verify(token, process.env.SECRET_KEY as string, async (err, decoded:any)=>{
            if(err){
                res.status(403).json({
                    message : "Invalid token"
                })
            return
            }
                //check if that decoded object id  user exists or not
             try {
                const userData =  await User.findByPk(decoded.id)
                if(!userData){
                  res.status(401).json({
                      message : "No user with that token exists"
                  })
                return 
                }

                req.user = userData
                next()

             } catch (error) {
                res.status(500).json({
                    message : "Something went wrong"
                })          
            }
        })
    }

    restrictTo(...roles:Role[]){
        return (req:AuthRequest, res:Response, next:NextFunction)=>{
            let userRole = req.user?.role as Role
            if(!roles.includes(userRole)){
                res.status(403).json({
                    message : "You don't have permisssion"
                })
            }else {
                next()
            }
        }
    }
}
export default new AuthMiddleware()