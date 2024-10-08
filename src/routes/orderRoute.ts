import express, {Router} from 'express'
import authMiddleware, { Role } from '../middleware/authMiddleware'
import errorHandler from '../services/catchAsync'
import orderController from '../controllers/orderController'




const router:Router = express.Router()

//Routes
router.route("/")
.post(authMiddleware.isAuthenticated, errorHandler(orderController.createOrder))
.get(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin), errorHandler(orderController.fetchAllOrders))


router.route("/verify")
.post(authMiddleware.isAuthenticated, errorHandler(orderController.verifyTransaction))

router.route("/customer")
.get(authMiddleware.isAuthenticated, errorHandler(orderController.fetchMyOrders))

router.route("/customer/:id")
.get(authMiddleware.isAuthenticated, errorHandler(orderController.fetchOrderDetails))
.patch(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Customer), errorHandler(orderController.cancelMyOrder))

router.route("/admin/payment/:id")
.patch(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(orderController.changePaymentStatus))

router.route("/admin/:id")
.patch(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(orderController.changeOrderStatus))
.delete(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(orderController.deleteOrder))
router.route("/:id")
.get(authMiddleware.isAuthenticated, errorHandler(orderController.fetchOrderDetails))
//Routes end

export default router
