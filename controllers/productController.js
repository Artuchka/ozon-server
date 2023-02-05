const { StatusCodes } = require("http-status-codes")
const { Products } = require("../models/productModel")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")
const { uploadToCloud } = require("../utils/uploadFile")
const { Statistics } = require("../models/StatisticsModel")

const getAllProducts = async (req, res) => {
	const query = req.query

	let queryObj = {}
	if ("title" in query) {
		queryObj.title = { $regex: query.title, $options: "i" }
	}
	if ("imagesAmount" in query) {
		queryObj["$expr"] = {
			$gte: [{ $size: "$images" }, Number(query.imagesAmount)],
		}
	}
	if ("companies" in query) {
		queryObj["companies"] = { $in: query.companies.split(",") }
	}
	if ("tags" in query) {
		queryObj["tags"] = { $in: query.tags.split(",") }
	}
	if ("categories" in query) {
		queryObj["categories"] = { $in: query.categories.split(",") }
	}
	if ("numericFilters" in query) {
		const operatorsMap = {
			"<": "$lt",
			"<=": "$lte",
			">": "$gt",
			">=": "$gte",
			"=": "$eq",
		}

		const allowedNames = ["averageRating", "price", "numOfReviews"]

		const filters = query.numericFilters.split(",")
		const replaced = filters.map((expr) =>
			expr.replace(/(<=|>=|=|>|<)/, (substr) => {
				if (substr in operatorsMap) {
					return `-${operatorsMap[substr]}-`
				}
				return ""
			})
		)
		replaced.forEach((item) => {
			const [name, sign, value] = item.split("-")
			if (allowedNames.includes(name)) {
				queryObj = {
					...queryObj,
					[name]: { ...queryObj[name], [sign]: value },
				}
			}
		})
	}
	let sortParam = "createdAt"
	if ("sort" in query) {
		const allowedSort = [
			"averageRating",
			"price",
			"numOfReviews",
			"-averageRating",
			"-price",
			"-numOfReviews",
		]
		sortParam = query.sort
			.split(",")
			.filter((param) => allowedSort.includes(param))
			.join(" ")
	}
	sortParam = sortParam || "createdAt"

	const page = Number(query.page) || 1
	const limit = Number(query.limit) || 3
	const skip = limit * (page - 1)

	const mongoQueryAll = Products.find()
	const mongoQueryFiltered = mongoQueryAll.clone().find(queryObj)
	const mongoQueryPaged = mongoQueryFiltered
		.clone()
		.sort(`${sortParam} _id`)
		.skip(skip)
		.limit(limit)

	const allProducts = await mongoQueryAll
	const pagesProducts = await mongoQueryPaged
	const filteredProducts = await mongoQueryFiltered

	const productsFound = filteredProducts.length
	const pagesFound = Math.ceil(productsFound / limit)

	const details = {
		productsFound,
		pagesFound,
	}

	res.status(StatusCodes.OK).json({
		msg: "Филтрованные товары🤞",
		products: pagesProducts,
		details,
	})
}

const getProductsDetails = async (req, res) => {
	const allProducts = await Products.find()

	let maxPrice = 0
	let minPrice = allProducts[0].price
	const companies = new Set()
	const categories = new Set()
	const tags = new Set()
	allProducts.forEach((product) => {
		const { price } = product
		if (price > maxPrice) {
			maxPrice = price
		}
		if (price < minPrice) {
			minPrice = price
		}
		product.companies.forEach((company) => {
			companies.add(company)
		})
		product.categories.forEach((category) => {
			categories.add(category)
		})
		product.tags.forEach((tag) => {
			tags.add(tag)
		})
	})

	const details = {
		maxPrice,
		minPrice,
		companies: Array.from(companies),
		tags: Array.from(tags),
		categories: Array.from(categories),
	}

	res.status(StatusCodes.OK).json({
		msg: "Детализация товаров рассчитана!🤞",
		details,
	})
}

const getMyProducts = async (req, res) => {
	let sortParam = "createdAt"
	const { userId } = req.user

	const products = await Products.find({
		vendor: userId,
	}).sort(sortParam)

	res.status(StatusCodes.OK).json({
		msg: "Ваши товары!",
		products,
	})
}

const adminId = "639da92965c6529fd71fa73a"
const getSingleProduct = async (req, res) => {
	const { id } = req.params

	const userId = req?.user?.userId
	const newVisit = { date: Date.now(), user: userId ? userId : adminId }

	await Statistics.updateOne(
		{ product: id },
		{ $push: { visits: newVisit } },
		{ upsert: true }
	)

	const product = await Products.findOne({ _id: id })
		.populate({
			path: "reviews",
			select: "title comment rating createdAt images videos",
			populate: {
				path: "author",
				select: "email username avatar",
			},
		})
		.populate({
			path: "vendor",
			select: "email username avatar",
		})
	if (!product) {
		throw new NotFoundError(`Нет товара с id ${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "Товар получен!",
		product,
	})
}

const createProduct = async (req, res) => {
	console.log(req.body)
	req.body.specs = JSON.parse(req.body.specs)
	req.body.companies = JSON.parse(req.body.companies)
	req.body.categories = JSON.parse(req.body.categories)
	req.body.tags = JSON.parse(req.body.tags)
	const product = await Products.create({
		...req.body,
		vendor: req.user.userId,
	})

	res.status(StatusCodes.OK).json({
		msg: "Товар создан!",
		product,
	})
}

const updateProduct = async (req, res) => {
	const { id } = req.params

	const product = await Products.findOne({ _id: id })
	if (!product) {
		throw new NotFoundError(`Нет товара с id ${id}`)
	}

	const allowed = [
		"description",
		"title",
		"price",
		"specs",
		"companies",
		"categories",
		"tags",
		"images",
	]

	req.body.specs = JSON.parse(req.body.specs)
	req.body.companies = JSON.parse(req.body.companies)
	req.body.categories = JSON.parse(req.body.categories)
	req.body.tags = JSON.parse(req.body.tags)

	Object.keys(req.body).forEach((key) => {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(
				`😡Запрещенно обновлять поле \`${key}\` у товара😡`
			)
		}
		product[key] = req.body[key]
	})
	await product.save()

	res.status(StatusCodes.OK).json({
		msg: "Товар обновлен!",
		product,
	})
}
const deleteProduct = async (req, res) => {
	const { id } = req.params

	const product = await Products.findOne({ _id: id }).select(
		"title description price"
	)
	if (!product) {
		throw new NotFoundError(`Нет товара с id ${id}`)
	}

	await product.remove()

	res.status(StatusCodes.OK).json({
		msg: "➖Товар удален!➖",
		product,
	})
}

const uploadImage = async (req, res) => {
	const maxSizeImage = 1024 * 1024 * 2
	let images = req?.files?.images

	if (images?.name && !images.length) {
		images = [images]
	}
	if (!images || images?.length < 1) {
		throw new BadRequestError(`Пожалуйста, предоставьте фото`)
	}
	console.log({ images })
	let initialBytesAmount = 0
	const uploadImagesInfo = await Promise.allSettled(
		images.map(async (img) => {
			initialBytesAmount += img.size
			return await uploadToCloud(img, "image", maxSizeImage)
		})
	)

	let allBytesSaved = 0
	console.log({ uploadImagesInfo })
	// console.log({ valueUpper: uploadImagesInfo?.[0]?.value })
	const uploadPaths = uploadImagesInfo.map((promisedImage) => {
		console.log(promisedImage)
		const imageInfo = promisedImage.value
		allBytesSaved += imageInfo.bytesSaved
		return imageInfo.image.secure_url
	})

	const savedPercentage = (
		(allBytesSaved / initialBytesAmount) *
		100
	).toFixed(2)

	res.status(StatusCodes.OK).json({
		msg: `${images.length} фото загружено, сжали на ${savedPercentage}% 🤞`,
		paths: uploadPaths,
	})
}

const uploadVideo = async (req, res) => {
	const maxSizeVideo = 1024 * 1024 * 10
	let videos = req?.files?.videos
	console.log({ videos })
	// todo: use isArray() instead
	if (videos.name && !videos.length) {
		videos = [videos]
	}
	if (!videos || videos.length < 1) {
		throw new BadRequestError(`Пожалуйста, предоставьте видео`)
	}

	const uploadVideosInfo = await Promise.allSettled(
		videos.map(async (img) => {
			return await uploadToCloud(img, "video", maxSizeVideo)
		})
	)

	const uploadPaths = uploadVideosInfo.map((promisedVideo) => {
		const videoInfo = promisedVideo.value
		return videoInfo.video.secure_url
	})

	res.status(StatusCodes.OK).json({
		msg: `${videos.length} видео загружено🤞`,
		paths: uploadPaths,
	})
}

module.exports = {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	uploadImage,
	deleteProduct,
	uploadVideo,
	getMyProducts,
	getProductsDetails,
	adminId,
}
