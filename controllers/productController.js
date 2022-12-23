const { StatusCodes } = require("http-status-codes")
const { Products } = require("../models/productModel")
const path = require("path")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")

const getAllProducts = async (req, res) => {
	const products = await Products.find()
	res.status(StatusCodes.OK).json({
		msg: "all products",
		amount: products.length,
		products,
	})
}

const getSingleProduct = async (req, res) => {
	const { id } = req.params
	const product = await Products.findOne({ _id: id })
		.populate({
			path: "reviews",
			select: "title comment rating",
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
