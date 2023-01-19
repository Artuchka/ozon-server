const express = require("express")
const {
	getAllOrders,
	createOrder,
	getCurrentUserCart,
	deleteOrder,
	updateOrder,
	addToCart,
} = require("../controllers/orderController")
const { roleMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.route("/").get(getCurrentUserCart).post(createOrder)

router.route("/:orderId").delete(deleteOrder).patch(updateOrder).post(addToCart)

router.route("/allOrders").get(roleMiddleware("admin"), getAllOrders)

module.exports = { orderRouter: router }
