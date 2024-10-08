import express, {Router} from 'express'
import AuthController from '../controllers/userController'
import authMiddleware, { Role } from '../middleware/authMiddleware'
import errorHandler from '../services/catchAsync'
const router:Router = express.Router()

//Routes

router.route("/register")
.post(errorHandler(AuthController.registerUser))

router.route("/login")
.post(errorHandler(AuthController.loginUser))

router.route("/users")
.get(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(AuthController.fetchUsers))

router.route("/users/:id")
.delete(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), errorHandler(AuthController.deleteUser))
//Routes end
export default router
