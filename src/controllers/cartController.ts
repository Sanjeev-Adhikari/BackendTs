import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart from "../database/models/Cart";
import Product from "../database/models/Product";
import User from "../database/models/User";
import Category from "../database/models/Category";

class CartController{
    async addToCart(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {quantity, productId} = req.body
        if(!quantity || !productId){
            res.status(401).json({
                message : "Please provide the required fields"
            })
            return
        }
         // check if the the product alreay exists in the cart table or not
         let cartItem = await Cart.findOne({
            where : {
                userId,
                productId
            }
         })
         if(cartItem){
            cartItem.quantity+= quantity
            await cartItem.save()
            return
         }
         //insert into cart table
         cartItem = await Cart.create({
            quantity,
            userId,
            productId
         })
         const data = await Cart.findAll({
            where : {
                userId
            }
         })
         res.status(200).json({
            message : "Product added to cart",
            data 
         })
    }

    async getCartItems(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const cartItems = await Cart.findAll({
            where : {
                userId
            },
            include : [
                {
                    model : Product,
                    include : [
                        {
                            model : Category,
                            attributes : ['id', 'categoryName']
                        }
                    ]
                },
               
            ]
           
        })
        if(cartItems.length === 0){
            res.status(404).json({
                message : "No item in cart"
            })
            return
        }

        res.status(200).json({
            message : "Cart Items fetched successfully",
            data : cartItems
        })

    }

    async deleteCartItem(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId} = req.params

        const product = await Product.findByPk(productId)
        if(!product){
            res.status(404).json({
                message : "No product with that id"
            })
            return
        }
        await Cart.destroy({
            where : {
                userId,
                productId
            }
        })

        res.status(200).json({
            message : "Product deleted from cart"

        })
    }

    async updateCartItems(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId} = req.params
        const {quantity} = req.body

        if(!quantity){
            res.status(401).json({
                message : "Please provide quantity"
            })
            return
        }
        const cartData = await Cart.findOne({
            where : {
                userId,
                productId
            }
        })
        if(!cartData){
            res.status(404).json({
                message : "No product with that userid"
            })
            return
        }

       cartData.quantity = quantity
       await cartData?.save()
       res.status(200).json({
        message : "Cart data upated successfully"
       })
    }
}
export default new CartController()