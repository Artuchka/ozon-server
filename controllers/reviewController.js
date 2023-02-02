const { StatusCodes } = require("http-status-codes")
const { Reviews } = require("../models/reviewModel")
const { NotFoundError, ForbiddenError } = require("../errors/customError")

const getAllReviews = async (req, res) => {
	const reviews = await Reviews.find({}).populate({
		path: "author",
		select: "email",
	})
	res.status(StatusCodes.OK).json({
		msg: "Все отзывы!",
		amount: reviews.length,
		reviews,
	})
}
const getMyReviews = async (req, res) => {
	const { userId } = req.user

	const reviews = await Reviews.find({
		author: userId,
	}).populate({
		path: "product",
		select: "title price numOfReviews images tags",
		populate: {
			path: "vendor",
			select: "username email firstName lastName",
		},
	})
	res.status(StatusCodes.OK).json({
		msg: "Все ваши отзывы!",
		amount: reviews.length,
		reviews,
	})
}
const createReview = async (req, res) => {
	const { title, comment, rating, productId, images, videos } = req.body

	const review = await Reviews.create({
		title,
		comment,
		rating,
		videos,
		images,
		product: productId,
		author: req.user.userId,
	})
	console.log(review)

	res.status(StatusCodes.CREATED).json({
		msg: "Добавили ваше мнение!🤞",
		review,
	})
}

const getSingleReview = async (req, res) => {
	const { id } = req.params
	const review = await Reviews.findOne({ _id: id })
	if (!review) {
		throw new NotFoundError(`Нет отзыва с id ${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "Отзыв получен!",
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
		msg: "➖Отзыв удален!➖",
		review,
	})
}

const updateSingleReview = async (req, res) => {
	const { id } = req.params
	const review = await Reviews.findOne({ _id: id })
	if (!review) {
		throw new NotFoundError(`Нет отзыва с id ${id}`)
	}

	const allowed = ["comment", "title", "rating", "images", "videos"]

	Object.keys(req.body).forEach((key) => {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(`😡Запрещенно обновнять поле \`${key}\`😡`)
		}
		review[key] = req.body[key]
	})

	await review.save()
	res.status(StatusCodes.OK).json({
		msg: "Отзыв обновлен!",
		review,
	})
}

module.exports = {
	getAllReviews,
	getSingleReview,
	updateSingleReview,
	deleteSingleReview,
	createReview,
	getMyReviews,
}
