//define datatypes here
export interface OrderData{
    phoneNumber : string,
    shippingAddress : string,
    totalAmount : number,
    paymentDetails : {
        paymentMethod : PaymentMethod,
        paymentStatus?: PaymentStatus,
        pidx?:string
    },
    items : orderDetails[]
}

export interface orderDetails{
    quantity : number,
    productId : string
}

export enum PaymentMethod{
    Cod = 'cod',
    Khalti = 'khalti'
}

export enum PaymentStatus{
    Paid = 'paid',
    Unpaid = 'unpaid'
}

export interface khaltiResponse{
    pidx : string,
    payment_url : string
    expires_at : Date | string,
    expires_in : number,
    user_fee : number

}

export interface TransactionVerificationResponse{
    pidx : string,
    total_amount : number,
    status : TransactionStatus,
    transaction_id : string,
    fee : boolean

}

export enum TransactionStatus{
    Completed = 'Completed',
    Pending = 'Pending',
    Initiated = 'Initiated',
    Refunded = 'Refunded' 

}

export enum OrderStatus{
    
    Pending = 'pending',
    Cancelled = 'cancelled',
    Ontheway = 'ontheway',
    Delivered = 'delivered',
    Preparation = 'underpreparation'

}