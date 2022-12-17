const { StatusCodes } = require("http-status-codes")
const { Orders } = require("../models/orderModel")
const { checkPermission } = require("../utils/checkPermission")
const { NotFoundError, ForbiddenError } = require("../errors/customError")

const getAllOrders = async (req, res) => {
	const orders = await Orders.find({})

	res.status(StatusCodes.OK).json({
		msg: "all",
		orders,
	})
}
const createOrder = async (req, res) => {
	const order = await Orders.create({
		...req.body,
		user: req.user.userId,
	})

	res.status(StatusCodes.CREATED).json({
		msg: "create",
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
const updateOrder = async (req, res) => {
	const { userId } = req.user
	const order = await Orders.findOne({ user: userId })
	if (!order) {
		throw new NotFoundError(`there is no order for user with id=${userId}`)
	}

	const allowed = [
		"status",
		"items",
		"total",
		"subtotal",
		"tax",
		"shippingFee",
	]
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
const deleteOrder = async (req, res) => {
	const { userId } = req.user
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

module.exports = {
	getAllOrders,
	createOrder,
	deleteOrder,
	updateOrder,
	getCurrentUserOrder,
}
