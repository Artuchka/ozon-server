const { StatusCodes } = require("http-status-codes")

const getAllReviews = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "all reviews",
	})
}
const createReview = async (req, res) => {
	res.status(StatusCodes.CREATED).json({
		msg: "createReview reviews",
	})
}
const getSingleReview = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "single reviews",
	})
}
const deleteSingleReview = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "delete single reviews",
	})
}

const updateSingleReview = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "updated single reviews",
	})
}

module.exports = {
	getAllReviews,
	getSingleReview,
	updateSingleReview,
	deleteSingleReview,
	createReview,
}
