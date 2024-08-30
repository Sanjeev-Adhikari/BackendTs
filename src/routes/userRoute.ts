import express, {Router} from 'express'
import AuthController from '../controllers/userController'
import errorHandler from '../services/catchAsync'
const router:Router = express.Router()

//Routes

router.route("/register")
.post(errorHandler(AuthController.registerUser))

router.route("/login")
.post(errorHandler(AuthController.loginUser))

//Routes end
export default router
