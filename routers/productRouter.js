const express = require("express")
const {
	getAllProducts,
	createProduct,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
} = require("../controllers/productController")
const { roleMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router
	.route("/")
	.get(getAllProducts)
	.post(roleMiddleware("admin", "vendor"), createProduct)

router
	.route("/uploadImage")
	.post(roleMiddleware("admin", "vendor"), uploadImage)

router
	.route("/:id")
	.get(getSingleProduct)
	.patch(roleMiddleware("admin", "vendor"), updateProduct)
	.delete(roleMiddleware("admin", "vendor"), deleteProduct)

module.exports = { productRouter: router }
