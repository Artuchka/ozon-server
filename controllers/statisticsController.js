const { StatusCodes } = require("http-status-codes")
const { Statistics } = require("../models/StatisticsModel")
const { checkPermission } = require("../utils/checkPermission")

const getAllMyStatistics = async (req, res) => {
	const { userId } = req.user

	const stats = await Statistics.find({
		"product.vendor": userId,
	})

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

	checkPermission(req.user, stat.product.vendor._id)

	// console.log({ stats })

	res.status(StatusCodes.OK).json({
		msg: "single statistics",
		stat,
	})
}

module.exports = { getMySingleStatistics, getAllMyStatistics }
