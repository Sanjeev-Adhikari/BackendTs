import {Request, Response} from 'express'
import Product from '../database/models/Product'
import { AuthRequest } from '../middleware/authMiddleware'
import User from '../database/models/User'
import Category from '../database/models/Category'
import fs from 'fs'



class ProductController{
    async addProduct(req:AuthRequest, res:Response):Promise<void>{
        //take the input
        const userId = req.user?.id
        const {productName, productDescription, productPrice, productStockQty, categoryId} = req.body
        let fileName
        if(req.file){
            fileName  = "http://localhost:3000/" + req.file?.filename
        }else{
            fileName = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhZHBob25lfGVufDB8fDB8fHww"
        }
        if(!productName || !productDescription || !productPrice || !productStockQty || !categoryId){
            res.status(400).json({
                message : "Please Provide the required fields"
            })
            return
        }
        await Product.create({
            productName,
            productDescription,
            productPrice,
            productStockQty,
            productImageUrl: fileName,
            userId : userId,
            categoryId : categoryId
        })
        res.status(200).json({
            message : "product created successfully"
        })
    }

    async getAllProducts(req:Request, res:Response):Promise<void>{
        const data = await Product.findAll({
            include : [
                {
                    model : User,
                    attributes : ['id' , 'username' , 'email']
                },
                {
                    model : Category,
                    attributes : ['id' , 'categoryName']
                }
            ]
        })
        res.status(200).json({
            message : "Products fetched succesdfully",
            data
        })
    }

    async getSingleProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const data = await Product.findOne({
            where : {
                id : id
            },
            include : [
                {
                    model : User,
                    attributes : ['id','username', 'email' ]
                },
                {
                    model : Category,
                    attributes : ['id', 'categoryName']
                }
            ]
        })
        if(!data){
            res.status(404).json({
                message : "No product found with that id"
            })
            return
        }

        res.status(200).json({
            message : "Single Product fetched successfully",
            data
        })
    }

    async deleteProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const data = await Product.findAll({
            where : {
                id : id
            }
        })
        if(data.length > 0){
            await Product.destroy({
                where : {
                    id : id
                }
            })
            res.status(200).json({
                message : "Product deleted successfully",
                data : []
            })
            return
        }
        res.status(400).json({
            message : "No product with that id"
        })

    }

    async editProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const {productName, productDescription, productPrice, productStockQty, categoryId} = req.body
        if(!productName || !productDescription || !productPrice || !productStockQty || !categoryId || !id){
            res.status(400).json({
                message : "Please Provide the required fields"
            })
            return
        }
        const oldData = await Product.findOne({
            where : {
                id : id
            }
        })
        if(!oldData){
            res.status(404).json({
                message : "No data found with that id"
            })
        }
        //delete the old image
        const oldProductImage = oldData?.productImageUrl
        const lengthToCut = process.env.BACKEND_URL?.length || 0
        const finalFilePathAfterCut = oldProductImage?.slice(lengthToCut)
        if(req.file && req.file.filename){
            //remove file from upload folder
            fs.unlink("./src/uploads/" +  finalFilePathAfterCut,(err)=>{
                if(err){
                    console.log("error deleting file",err) 
                }else{
                    console.log("file deleted successfully")
                }
            })
    }

    const datas = await Product.update(
        {
            productName,
            productDescription,
            productPrice,
            productStockQty,
            categoryId,
            productImageUrl : req.file && req.file.filename ? process.env.BACKEND_URL + req.file.filename : oldProductImage
        },
        {
            where: { id: id } // Specify the condition to update the product with the given ID
        }
    );
    res.status(200).json({
        message : "Product updated successfully",
        data : datas
    })
}
}


export default new ProductController()