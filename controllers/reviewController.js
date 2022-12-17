const { StatusCodes } = require("http-status-codes")
const { Reviews } = require("../models/reviewModel")
const { NotFoundError, ForbiddenError } = require("../errors/customError")

const getAllReviews = async (req, res) => {
	const reviews = await Reviews.find({}).populate({
		path: "author",
		select: "email",
	})
	res.status(StatusCodes.OK).json({
		msg: "all reviews",
		amount: reviews.length,
		reviews,
	})
}
const createReview = async (req, res) => {
	const { title, comment, rating, productId } = req.body

	const review = await Reviews.create({
		title,
		comment,
		rating,
		product: productId,
		author: req.user.userId,
	})
	console.log(review)

	res.status(StatusCodes.CREATED).json({
		msg: "createReview reviews",
		review,
	})
}
const getSingleReview = async (req, res) => {
	const { id } = req.params
	const review = await Reviews.findOne({ _id: id })
	if (!review) {
		throw new NotFoundError(`no review with id=${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "single reviews",
		review,
	})
}
const deleteSingleReview = async (req, res) => {
	const { id } = req.params
	const review = await Reviews.findOne({ _id: id })
	if (!review) {
		throw new NotFoundError(`no review with id=${id}`)
	}

	await review.remove()
	res.status(StatusCodes.OK).json({
		msg: "delete single reviews",
		review,
	})
}

const updateSingleReview = async (req, res) => {
	const { id } = req.params
	const review = await Reviews.findOne({ _id: id })
	if (!review) {
		throw new NotFoundError(`no review with id=${id}`)
	}

	const allowed = ["comment", "title", "rating"]

	Object.keys(req.body).forEach((key) => {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(
				`it's forbidden to update \`${key}\` value`
			)
		}
		review[key] = req.body[key]
	})

	await review.save()
	res.status(StatusCodes.OK).json({
		msg: "updated single reviews",
		review,
	})
}

module.exports = {
	getAllReviews,
	getSingleReview,
	updateSingleReview,
	deleteSingleReview,
	createReview,
}
