const express = require("express")
const {
	getAllProducts,
	createProduct,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
} = require("../controllers/productController")
const {
	roleMiddleware,
	authMiddleware,
} = require("../middleware/authMiddleware")
const router = express.Router()

router
	.route("/")
	.get(getAllProducts)
	.post(authMiddleware, roleMiddleware("admin", "vendor"), createProduct)

router
	.route("/uploadImage")
	.post(authMiddleware, roleMiddleware("admin", "vendor"), uploadImage)

router
	.route("/:id")
	.get(getSingleProduct)
	.patch(authMiddleware, roleMiddleware("admin", "vendor"), updateProduct)
	.delete(authMiddleware, roleMiddleware("admin", "vendor"), deleteProduct)

module.exports = { productRouter: router }
