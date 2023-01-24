const { StatusCodes } = require("http-status-codes")
const { Statistics } = require("../models/StatisticsModel")

const getAllMyStatistics = async (req, res) => {
	const stats = await Statistics.find({})

	res.status(StatusCodes.OK).json({
		msg: "all my statistics",
		stats,
	})
}

const getMySingleStatistics = async (req, res) => {
	const { productId } = req.query
	console.log({ productId })
	const stats = await Statistics.findOne({ product: productId })

	res.status(StatusCodes.OK).json({
		msg: "single statistics",
		stats,
	})
}

module.exports = { getMySingleStatistics, getAllMyStatistics }
