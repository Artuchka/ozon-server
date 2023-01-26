const express = require("express")
const { roleMiddleware } = require("../middleware/authMiddleware")
const {
	getAllMyStatistics,
	getMySingleStatistics,
} = require("../controllers/statisticsController")

const router = express.Router()

router.route("/").get(roleMiddleware("vendor", "admin"), getAllMyStatistics)

router
	.route("/:productId")
	.get(roleMiddleware("vendor", "admin"), getMySingleStatistics)

module.exports = { statisticsRouter: router }
