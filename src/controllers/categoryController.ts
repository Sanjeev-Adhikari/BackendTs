import Category from "../database/models/Category"
import {Request, Response} from 'express'

class CategoryController{
    categoryData = [
        {
            categoryName : 'Electronics'
        },
        {
            categoryName : 'Food/Beverages'
        },
        {
            categoryName : 'Groceries'
        }
    ]
    async seedCategory():Promise<void>{
        const datas = await Category.findAll()
        if(datas.length === 0){
            const data = await Category.bulkCreate(this.categoryData )
            console.log("Category data seeded successfully")         
        }else{
            console.log("Category already seeded")
        }
    }

    async addCategory(req:Request, res:Response):Promise<void>{
        const {categoryName} = req.body
        if(!categoryName){
            res.status(401).json({
                message : "Please provide category name"
            })
            return
        }

        await Category.create({
            categoryName
        })

        res.status(200).json({
            message : "Category added successfully"
        })
    }

    async getCategory(req:Request, res:Response):Promise<void>{
        const data = await Category.findAll()
       res.status(200).json({
        message : "Category fetched successfully",
        data
       })
    }

    async deleteCategory(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const data = await Category.findAll({
            where : {
                id : id
            }
        })

        if(data.length === 0){
            res.status(401).json({
                message : "No category with that id"
            })
            return
        }
        await Category.destroy({
            where : {
                id : id
            }
        })

        res.status(200).json({
            message : "Category deleted successfully"
        })
    }

    async updateCategory(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const {categoryName} = req.body
        await Category.update({
            categoryName
        },{
            where : {
                id : id
            }
        })
        res.status(200).json({
            message : "Category updated successfully",
            
        })       
    }
}
export default new CategoryController()