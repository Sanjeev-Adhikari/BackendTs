import express, {Router} from 'express'
import authMiddleware, { Role } from '../middleware/authMiddleware'
import categoryController from '../controllers/categoryController'

const router:Router = express.Router()

//Routes
router.route("/")
.post(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin), categoryController.addCategory)
.get(categoryController.getCategory)

router.route("/:id")
.delete(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin),categoryController.deleteCategory)
.patch(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin),categoryController.updateCategory)
//Routes end

export default router
