const { StatusCodes } = require("http-status-codes")
const { Products } = require("../models/productModel")
const path = require("path")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")
const { title } = require("process")
const { log } = require("console")

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

	let maxPrice = 0
	let minPrice = allProducts[0].price

	const productsFound = filteredProducts.length
	const pagesFound = Math.ceil(productsFound / limit)

	allProducts.forEach((product) => {
		const { price } = product
		if (price > maxPrice) {
			maxPrice = price
		}
		if (price < minPrice) {
			minPrice = price
		}
	})

	const companies = new Set()
	const categories = new Set()
	const tags = new Set()
	allProducts.forEach((product) => {
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
		productsFound,
		pagesFound,
		maxPrice,
		minPrice,
		companies: Array.from(companies),
		tags: Array.from(tags),
		categories: Array.from(categories),
	}

	res.status(StatusCodes.OK).json({
		msg: "all products",
		products: pagesProducts,
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
		msg: "all products",
		products,
	})
}

const getSingleProduct = async (req, res) => {
	const { id } = req.params
	const product = await Products.findOne({ _id: id })
		.populate({
			path: "reviews",
			select: "title comment rating createdAt",
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
		throw new NotFoundError(`no product with id = ${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "getSingleProduct",
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
		msg: "create product",
		product,
	})
}

const updateProduct = async (req, res) => {
	const { id } = req.params

	const product = await Products.findOne({ _id: id })
	if (!product) {
		throw new NotFoundError(`no product with id = ${id}`)
	}

	const allowed = ["description", "title", "price"]

	Object.keys(req.body).forEach((key) => {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(
				`it's forbidden to update \`${key}\` value`
			)
		}
		product[key] = req.body[key]
	})
	await product.save()

	res.status(StatusCodes.OK).json({
		msg: "updateProduct product",
		product,
	})
}
const deleteProduct = async (req, res) => {
	const { id } = req.params

	const product = await Products.findOne({ _id: id }).select(
		"title description price"
	)
	if (!product) {
		throw new NotFoundError(`no product with id = ${id}`)
	}

	await product.remove()

	res.status(StatusCodes.OK).json({
		msg: "deleteProduct product",
		product,
	})
}

const maxSize = 1024 * 1024 * 2
const uploadImage = async (req, res) => {
	let images = req?.files?.images
	if (images.name && !images.length) {
		images = [images]
	}
	if (!images || images.length < 1) {
		throw new BadRequestError(`please provide image/images`)
	}
	const uploadPaths = images.map((img) => {
		return upload(img)
	})

	res.status(StatusCodes.OK).json({
		msg: `${images.length} images uploaded`,
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
	getMyProducts,
}

const upload = (image) => {
	if (!image?.mimetype?.match(/image\//)) {
		throw new BadRequestError(`please provide image only`)
	}
	if (image?.size > maxSize) {
		throw new BadRequestError(
			`the image is too big, send only up to ${
				maxSize / 1024 / 1024
			} MB = ${maxSize} bytes`
		)
	}

	const uploadPath = `/uploads/products/${image.name}`

	image.mv(path.join(__dirname, "../public", uploadPath), (err) => {
		if (err) {
			console.log(err)
		} else {
			console.log("uploaded image")
		}
	})
	return uploadPath
}
