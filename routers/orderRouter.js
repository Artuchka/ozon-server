const express = require("express")
const {
	getAllOrders,
	createOrder,
	getCurrentUserCart,
	deleteOrder,
	updateOrder,
	addToCart,
	createPaymentIntent,
	getSingleByPaymentSecret,
	getSingleByOrderId,
	getMyOrders,
	refundOrder,
} = require("../controllers/orderController")
const { roleMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.route("/").get(getCurrentUserCart).post(createOrder)

router.route("/allOrders").get(roleMiddleware("admin"), getAllOrders)
router.route("/myOrders").get(getMyOrders)
router.route("/payment-secret/:paymentSecret").get(getSingleByPaymentSecret)

router
	.route("/create-payment-intent")
	.post(roleMiddleware("user", "vendor", "admin"), createPaymentIntent)

router
	.route("/create-refund")
	.post(roleMiddleware("user", "vendor", "admin"), refundOrder)

router
	.route("/:orderId")
	.delete(deleteOrder)
	.patch(updateOrder)
	.post(addToCart)
	.get(getSingleByOrderId)

module.exports = { orderRouter: router }
