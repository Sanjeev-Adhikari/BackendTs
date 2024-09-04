import {Request, Response} from 'express'
import {AuthRequest} from '../middleware/authMiddleware'
import {khaltiResponse, OrderData, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse} from '../types/orderTypes'
import Order from '../database/models/Order'
import Payment from '../database/models/Payment'
import OrderDetail from '../database/models/OrderDetail'
import axios from 'axios'
import Product from '../database/models/Product'
import Category from '../database/models/Category'
import User from '../database/models/User'

class ExtendedOrder extends Order{
    declare paymentId : string | null
}

class OrderController{
    async createOrder(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {phoneNumber,shippingAddress,totalAmount,paymentDetails,items}:OrderData = req.body 
        if(!phoneNumber || !shippingAddress || !totalAmount || !paymentDetails || !paymentDetails.paymentMethod || items.length == 0  ){
            res.status(400).json({
               message :  "Please provide the required fields"
            })
            return
        }
        const paymentData = await Payment.create({
            paymentMethod: paymentDetails.paymentMethod
         })
        const orderData = await Order.create({
            userId,
            phoneNumber,
            shippingAddress,
            totalAmount,
            paymentId : paymentData.id
        })
        for (var i = 0; i<items.length; i++){
           await OrderDetail.create({
                quantity : items[i].quantity,
                productId : items[i].productId,
                orderId : orderData.id
            })
        }
        if(paymentDetails.paymentMethod === PaymentMethod.Khalti){
            //integrate khalti gateway
            const data = {
                return_url : "http://localhost:3000/success",
                purchase_order_id : orderData.id,
                amount : totalAmount * 100,
                website_url : "http://localhost:3000",
                purchase_order_name : 'orderName_' + orderData.id
            }
            const response = await axios.post("https://a.khalti.com/api/v2/epayment/initiate/", data,
                {
                    headers : {
                            'Authorization' : 'key a6ebbd154dcc4b0380a117d41049920e'
                    }
                }
            )
            const khaltiResponse:khaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            res.status(200).json({
                message : "Order placed successfully",
                url : khaltiResponse.payment_url,
            })  
            return
        }
        res.status(200).json({
            message : "Order placed successfully"
        })
        return
    }

    async verifyTransaction(req:AuthRequest, res:Response):Promise<void>{
        const {pidx} = req.body

        if(!pidx){
            res.status(400).json({
                message : "Please provide pidx"
            })
        }
        const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", {pidx},{
            headers : {
                  'Authorization' : 'key a6ebbd154dcc4b0380a117d41049920e'
            }
        })
        const data:TransactionVerificationResponse = response.data
        if(data.status === TransactionStatus.Completed){
            await Payment.update({paymentStatus : 'paid'}, {
                where : {
                    pidx : pidx
                }
            })
            res.status(200).json({
                message : 'Payment verified successfully'
            })
            return
        }
        res.status(200).json({
            message : 'payment not verified'
        })
    }

    async fetchMyOrders(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id

        const orders = await Order.findAll({
            where : {
                userId : userId
            },
            include : [
                {
                    model : Payment
                }
            ]
        })

        if(orders.length > 0){
            res.status(200).json({
                message : "Orders fetched successfully",
                data : orders
            })
            return
        }

        res.status(404).json({
            message : "You have no orders yet",
            data : []
        })
    }

    async fetchOrderDetails(req:Request, res:Response):Promise<void>{
        const orderId = req.params.id
        const orderDetails = await OrderDetail.findAll({
            where : {
                orderId : orderId
            },
            include : [
                {
                    model : Product,
                        include : [
                        {
                            model : Category,
                            attributes : ['categoryName']
                        }
                    ]
                },              
                {
                    model : Order,
                        include : [
                            {
                                model : Payment,
                                attributes: ['paymentMethod', 'paymentStatus']
                            },
                            {
                                model : User,
                                attributes : ['username', 'email']
                            }
                        ]
                }              
            ],                  
        })

        if(orderDetails.length > 0){
            res.status(200).json({
                message : "OrderDetails fetched successfully",
                data : orderDetails
            })
            return
        }

        res.status(404).json({
            message : "No orderdetails with that id",
            data : []
        })
    }

    async cancelMyOrder(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const orderId = req.params.id

        const order:any = await Order.findAll({
            where : {
                userId,
                id:orderId
            }
        })

        if(order?.orderStatus === OrderStatus.Ontheway || order?.orderStatus === OrderStatus.Preparation){
            res.status(200).json({
                message : "You can't cancell the order as it is ontheway/underpreparatoin"
            })
            return
        }
        
        await Order.update({orderStatus : OrderStatus.Cancelled},{
            where : {
                id: orderId
            }
        })
        res.status(200).json({
            message : "Order cancelled successfully"
        })
    }
    //Admin apis now 
    async changeOrderStatus(req:Request, res:Response):Promise<void>{
        const orderId = req.params.id
        const orderStatus : OrderStatus = req.body.orderStatus
        await Order.update({orderStatus : orderStatus}, {
            where : {
                id:orderId
            }
        })
        res.status(200).json({
            message : "Order status updated successfully"
        })
    }

    async changePaymentStatus(req:Request, res:Response):Promise<void>{
        const orderId = req.params.id
        const paymentStatus:PaymentStatus = req.body.paymentStatus
        const order:any = await Order.findByPk(orderId)
        const extenderOrder : ExtendedOrder = order as ExtendedOrder
        await Payment.update({paymentStatus : paymentStatus}, {
            where : {
                id : extenderOrder.paymentId

            }
        })
        res.status(200).json({
            message : `payment status of OrderId${orderId} updated successfully to ${paymentStatus}`
        })
    }

    async deleteOrder(req:Request, res:Response):Promise<void>{
        const orderId = req.params.id
        const order = await Order.findByPk(orderId)
        const extendedOrder : ExtendedOrder = order as ExtendedOrder
        if(order){
            //delete order
            await Order.destroy({
                where : {
                    id: orderId
                }
            })
            //delete Order details
            await OrderDetail.destroy({
                where : {
                    orderId
                }
            })
            //delete paymentdetails
            await Payment.destroy({
                where :{
                    id : extendedOrder.paymentId
                }
            })

            res.status(200).json({
                message : "Order deleted successfully"
            })
            return
        }

        res.status(404).json({
            message : "No order with that orderId"
        })
    }
     
    async fetchAllOrders(req:Request, res:Response):Promise<void>{

        const orders = await Order.findAll({
            include : [
                {
                    model : Payment
                }
            ]
        })

        if(orders.length > 0){
            res.status(200).json({
                message : "Orders fetched successfully",
                data : orders
            })
            return
        }

        res.status(404).json({
            message : "No orders yet",
            data : []
        })
    }
}
export default new OrderController()