const express = require("express")
const { roleMiddleware } = require("../middleware/authMiddleware")
const {
	getAllMyStatistics,
	getMySingleStatistics,
} = require("../controllers/statisticsController")

const router = express.Router()

router.route(roleMiddleware("vendor", "admin"), "/").get(getAllMyStatistics)

router
	.route(roleMiddleware("vendor", "admin"), "/:productId")
	.get(getMySingleStatistics)

module.exports = { statisticsRouter: router }
