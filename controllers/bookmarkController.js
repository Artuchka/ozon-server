const { StatusCodes } = require("http-status-codes")
const { Bookmarks } = require("../models/bookmarkModel")
const { default: mongoose } = require("mongoose")
const { Statistics } = require("../models/StatisticsModel")

const getAllBookmarks = async (req, res) => {
	const { userId } = req.user

	const bookmarks = await Bookmarks.find({
		user: userId,
	}).populate({
		path: "product",
		select: "title price averageRating numOfReviews images",
		populate: {
			path: "vendor",
			select: "username avatar firstName lastName",
		},
	})

	res.status(StatusCodes.OK).json({
		msg: "all bookmarks",
		bookmarks,
	})
}
const addBookmark = async (req, res) => {
	const { userId } = req.user
	const { productId } = req.body
	const bookmark = await Bookmarks.create({
		user: userId,
		product: productId,
	})

	const newAction = { date: Date.now(), user: userId ? userId : adminId }

	await Statistics.updateOne(
		{ product: productId },
		{ $push: { bookmarked: newAction } },
		{ upsert: true }
	)

	res.status(StatusCodes.OK).json({
		msg: "Теперь, я в закладках =)",
		bookmark,
	})
}
const deleteBookmark = async (req, res) => {
	const { userId } = req.user
	const { productId } = req.body
	const bookmark = await Bookmarks.findOneAndDelete({
		user: userId,
		product: productId,
	})

	const user = userId ? userId : adminId

	await Statistics.updateOne(
		{ product: productId },
		{ $pull: { bookmarked: { user: user } } },
		{ upsert: true }
	)

	res.status(StatusCodes.OK).json({
		msg: "deleteBookmark ",
		bookmark,
	})
}

module.exports = { addBookmark, getAllBookmarks, deleteBookmark }
