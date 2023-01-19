const express = require("express")
const {
	getAllOrders,
	createOrder,
	getCurrentUserCart,
	deleteOrder,
	updateOrder,
	addToCart,
	createPaymentIntent,
} = require("../controllers/orderController")
const { roleMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.route("/").get(getCurrentUserCart).post(createOrder)

router.route("/allOrders").get(roleMiddleware("admin"), getAllOrders)

router
	.route("/create-payment-intent")
	.post(roleMiddleware("user", "vendor", "admin"), createPaymentIntent)

router.route("/:orderId").delete(deleteOrder).patch(updateOrder).post(addToCart)

module.exports = { orderRouter: router }
