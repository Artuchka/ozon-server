const express = require("express")
const {
	getAllOrders,
	createOrder,
	getCurrentUserOrder,
	deleteOrder,
	updateOrder,
} = require("../controllers/orderController")
const { roleMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.route("/").get(getCurrentUserOrder).post(createOrder)

router.route("/:orderId").delete(deleteOrder).patch(updateOrder)

router.route("/allOrders").get(roleMiddleware("admin"), getAllOrders)

module.exports = { orderRouter: router }
