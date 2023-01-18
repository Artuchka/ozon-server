const { StatusCodes } = require("http-status-codes")
const { Orders } = require("../models/orderModel")
const { checkPermission } = require("../utils/checkPermission")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")
const { Products } = require("../models/productModel")

const getAllOrders = async (req, res) => {
	const orders = await Orders.find({})

	res.status(StatusCodes.OK).json({
		msg: "all",
		orders,
	})
}

const createOrder = async (req, res) => {
	const { status } = req.body
	const { userId } = req.user

	if (!status) {
		throw new BadRequestError(`please provide a status`)
	}
	console.log("user is ", req.user)
	if (status === "cart") {
		const foundOrder = await Orders.findOne({
			status: "cart",
			user: userId,
		})
		if (foundOrder) {
			throw new BadRequestError(
				`there already is CART order for user with id=${userId}`
			)
		}
	}
	const order = await Orders.create({
		...req.body,
		user: userId,
	})

	// subtotal:
	// shippingFee:
	// discounts:
	// total:
	// user:
	// status:

	res.status(StatusCodes.CREATED).json({
		msg: "create",
		order,
	})
}

const updateOrder = async (req, res, next) => {
	const { userId } = req.user
	const { orderId } = req.params

	const order = await Orders.findOne({ _id: orderId })
	if (!order) {
		throw new NotFoundError(`there is no order with id=${orderId}`)
	}

	const allowed = [
		"status",
		"items",
		"total",
		"subtotal",
		"shippingFee",
		"discounts",
	]

	if (order.status === "pending") {
		// const
	}

	if (order.status === "checkout" || req.body.status === "checkout") {
		const obj = { ...order._doc, ...req.body }
		const retObj = await checkCartItems(obj, next)
		if (retObj !== true) return retObj
	}

	for (const key in req.body) {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(`not allowed to update ${key} field`)
		}
		order[key] = req.body[key]
	}
	await order.save()

	res.status(StatusCodes.OK).json({
		msg: "update",
		order,
	})
}

const checkCartItems = async (
	{ items, total, subtotal, shippingFee, discounts },
	next
) => {
	console.log({ items })
	const countedSubtotal = await items.reduce(async (agg, item) => {
		const foundItem = await Products.findOne({ _id: item.product })
		if (!foundItem) {
			return next(
				new NotFoundError(`no such item with id ${item.product}`)
			)
		}
		return agg + foundItem.price * item.amount
	}, 0)

	const countedSubtotalFixed = countedSubtotal.toFixed(2)
	const subtotalFixed = subtotal.toFixed(2)

	console.log({ countedSubtotalFixed, subtotalFixed })
	if (subtotalFixed !== countedSubtotalFixed) {
		return next(
			new BadRequestError(
				`subtotals are bad: ${subtotalFixed} !== ${countedSubtotalFixed}(real)`
			)
		)
	}

	let countedTotal = countedSubtotal + shippingFee

	discounts.forEach((discount) => {
		if (discount.type === "minus") {
			countedTotal -= discount.value
		}
		console.log({ countedTotal, discount })
	})

	discounts.forEach((discount) => {
		if (discount.type === "percentage") {
			countedTotal *= discount.value
		}
		console.log({ countedTotal, discount })
	})

	const countedTotalFixed = countedTotal.toFixed(2)
	const totalFixed = total.toFixed(2)

	console.log({ countedTotalFixed, totalFixed })
	if (countedTotalFixed !== totalFixed) {
		return next(
			new BadRequestError(
				`totals are bad: ${totalFixed} !== ${countedTotalFixed}(real)`
			)
		)
	}

	return true
}

const deleteOrder = async (req, res) => {
	const { userId } = req.user
	const { orderId } = req.body
	if (orderId) {
		const order = await Orders.findOne({ _id: orderId })
		if (!order) {
			throw new NotFoundError(`there is no order(${orderId}) `)
		}
		await order.remove()
		res.status(StatusCodes.OK).json({
			msg: "deleted",
			order,
		})
	}

	const order = await Orders.findOne({ user: userId })
	if (!order) {
		throw new NotFoundError(`there is no order for user with id=${userId}`)
	}

	await order.remove()
	res.status(StatusCodes.OK).json({
		msg: "deleted",
		order,
	})
}

const getCurrentUserOrder = async (req, res) => {
	const { userId } = req.user
	const order = await Orders.findOne({ user: userId })
	if (!order) {
		throw new NotFoundError(`there is no order for user with id=${userId}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "current",
		order,
	})
}

module.exports = {
	getAllOrders,
	createOrder,
	deleteOrder,
	updateOrder,
	getCurrentUserOrder,
}
