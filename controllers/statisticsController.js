const { StatusCodes } = require("http-status-codes")
const { Statistics } = require("../models/StatisticsModel")
const { checkPermission } = require("../utils/checkPermission")
const { NotFoundError } = require("../errors/customError")
const { default: mongoose } = require("mongoose")

const getAllMyStatistics = async (req, res) => {
	const { userId } = req.user

	const stats = await Statistics.aggregate([
		{
			$lookup: {
				from: "products",
				localField: "product",
				foreignField: "_id",
				as: "productDetails",
			},
		},
		{
			$match: {
				"productDetails.vendor": mongoose.Types.ObjectId(userId),
			},
		},
	])

	console.log("-----------")
	console.log(stats)
	console.log("-----------")

	res.status(StatusCodes.OK).json({
		msg: "all my statistics",
		stats,
	})
}

const getMySingleStatistics = async (req, res) => {
	const { userId } = req.user
	const { productId } = req.params

	const stat = await Statistics.findOne({
		product: productId,
	}).populate({
		path: "product",
		populate: {
			path: "vendor",
		},
	})

	if (!stat) {
		throw new NotFoundError(`No stats for product with id = ${productId}`)
	}

	checkPermission(req.user, stat?.product?.vendor._id)

	// console.log({ stats })

	res.status(StatusCodes.OK).json({
		msg: "single statistics",
		stat,
	})
}

module.exports = { getMySingleStatistics, getAllMyStatistics }
