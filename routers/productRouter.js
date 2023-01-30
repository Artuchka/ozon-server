const express = require("express")
const {
	getAllProducts,
	createProduct,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
	getMyProducts,
	uploadVideo,
	getProductsDetails,
} = require("../controllers/productController")
const {
	roleMiddleware,
	authMiddleware,
} = require("../middleware/authMiddleware")
const router = express.Router()

router
	.route("/")
	.get(getAllProducts)
	.post(authMiddleware(), roleMiddleware("admin", "vendor"), createProduct)

router
	.route("/uploadImage")
	// .post(authMiddleware(), roleMiddleware("admin", "vendor"), uploadImage)
	.post(uploadImage)

router
	.route("/uploadVideo")
	// .post(authMiddleware(), roleMiddleware("admin", "vendor"), uploadVideo)
	.post(uploadVideo)

router
	.route("/my")
	.get(authMiddleware(), roleMiddleware("admin", "vendor"), getMyProducts)

router.route("/getDetails").get(getProductsDetails)

router
	.route("/:id")
	.get(authMiddleware({ isOptional: true }), getSingleProduct)
	.patch(authMiddleware(), roleMiddleware("admin", "vendor"), updateProduct)
	.delete(authMiddleware(), roleMiddleware("admin", "vendor"), deleteProduct)

module.exports = { productRouter: router }
