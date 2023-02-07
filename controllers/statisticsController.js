const { StatusCodes } = require("http-status-codes")
const { Statistics } = require("../models/StatisticsModel")
const { checkPermission } = require("../utils/checkPermission")
const { NotFoundError } = require("../errors/customError")
const { default: mongoose } = require("mongoose")
const { Products } = require("../models/productModel")

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

	const userProducts = await Products.find({ vendor: userId })
	const productsTotals = getMyProductTotals(userProducts)

	res.status(StatusCodes.OK).json({
		msg: "📈Общая статистика!📉",
		stats,
		productsTotals,
	})
}

function getMyProductTotals(products) {
	let totalPrice = 0
	let totalAverageRating = 0
	let totalNumOfReviews = 0
	let productsAmount = products?.length
	let totalImagesAmount = 0

	for (let index = 0; index < productsAmount; index++) {
		const { price, averageRating, numOfReviews, images } = products[index]

		totalPrice += price
		totalImagesAmount += images?.length
		totalAverageRating += averageRating
		totalNumOfReviews += numOfReviews
	}
	let averagePrice = totalPrice / productsAmount
	let averageImagesAmount = totalImagesAmount / productsAmount
	let averageRating = totalAverageRating / productsAmount
	let averageNumOfReviews = totalNumOfReviews / productsAmount

	averagePrice = parseFloat(averagePrice.toFixed(2))
	averageImagesAmount = parseFloat(averageImagesAmount.toFixed(2))
	averageRating = parseFloat(averageRating.toFixed(2))
	averageNumOfReviews = parseFloat(averageNumOfReviews.toFixed(2))
	return {
		totalPrice,
		averagePrice,
		productsAmount,
		averageImagesAmount,
		averageRating,
		averageNumOfReviews,
	}
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
		throw new NotFoundError(`Нет статистики по товару с id ${productId}`)
	}

	checkPermission(req.user, stat?.product?.vendor._id)

	res.status(StatusCodes.OK).json({
		msg: "📈Статистика по товару📉",
		stat,
	})
}

module.exports = { getMySingleStatistics, getAllMyStatistics }
