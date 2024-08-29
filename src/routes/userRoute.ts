import express, {Router} from 'express'
import AuthController from '../controllers/userController'
const router:Router = express.Router()

//Routes

router.route("/register")
.post(AuthController.registerUser)
//Routes end



export default router
