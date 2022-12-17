const express = require("express")
const {
	getAllReviews,
	createReview,
	getSingleReview,
	updateSingleReview,
	deleteSingleReview,
} = require("../controllers/reviewController")
const router = express.Router()

router.route("/").get(getAllReviews).post(createReview)

router
	.route("/:id")
	.get(getSingleReview)
	.patch(updateSingleReview)
	.delete(deleteSingleReview)

module.exports = { reviewRouter: router }
