import express, {Router} from 'express'
import CartController from '../controllers/cartController'
import authMiddleware from '../middleware/authMiddleware'
import cartController from '../controllers/cartController'


const router:Router = express.Router()

//Routes
router.route("/")
.post(authMiddleware.isAuthenticated,CartController.addToCart)
.get(authMiddleware.isAuthenticated, cartController.getCartItems)

router.route("/:productId")
.delete(authMiddleware.isAuthenticated, cartController.deleteCartItem)
.patch(authMiddleware.isAuthenticated, cartController.updateCartItems)
//Routes end

export default router
