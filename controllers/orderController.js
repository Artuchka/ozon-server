const { StatusCodes } = require("http-status-codes")
const { Orders } = require("../models/orderModel")
const { checkPermission } = require("../utils/checkPermission")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")
const { Products } = require("../models/productModel")
const {
	getStreetByCoordinates,
	getAddressByCoordinates,
} = require("../utils/location")
const { adminId } = require("./productController")
const { Statistics } = require("../models/StatisticsModel")

// This is your test secret API key.
const stripe = require("stripe")(
	"sk_test_51MAxWLBjYPBxkDu0F5giJjXsQorKYBLkDrhVFdgCrdb7W140cucAxZlMNHCICf4pMik8Hq6wNoeQYphpBQreY1Rj00jCSyIBC4"
)
const getAllOrders = async (req, res) => {
	const orders = await Orders.find({})

	res.status(StatusCodes.OK).json({
		msg: "all",
		orders,
	})
}

const getMyOrders = async (req, res) => {
	const { userId } = req.user
	const orders = await Orders.find({
		user: userId,
		status: { $not: { $eq: "cart" } },
	})
		.sort("-paidAt")
		.populate({
			path: "items.product",
			select: "title price description images",
		})

	const details = getMyOrdersDetails(orders)

	res.status(StatusCodes.OK).json({
		msg: "all my orders",
		orders,
		details,
	})
}
function getMyOrdersDetails(orders) {
	const details = {
		all: 0,
		pending: 0,
		paid: 0,
		checkout: 0,
		delivered: 0,
		refunded: 0,
	}

	orders.forEach(({ status }) => {
		details[status] += 1
	})
	details.all = orders.length
	return details
}

const getSingleByPaymentSecret = async (req, res) => {
	try {
		const { paymentSecret } = req.params
		const order = await Orders.findOne({
			clientSecret: paymentSecret,
		}).populate({
			path: "items.product",
			select: "title price description images",
		})

		if (!order) {
			throw new NotFoundError(
				`there is no order with clientSecret=${paymentSecret}`
			)
		}
		checkPermission(req.user, order.user)

		res.status(StatusCodes.OK).json({
			msg: "by payment secret",
			order,
		})
	} catch (error) {
		console.log(error)
	}
}

const getSingleByOrderId = async (req, res) => {
	try {
		const { orderId } = req.params

		const order = await Orders.findOne({
			_id: orderId,
		})
			.populate({
				path: "items.product",
				select: "title price description images ",
				populate: {
					path: "vendor",
					select: "firstName lastName username ",
				},
			})
			.populate({
				path: "user",
				select: "firstName lastName email phone",
			})
		const street = await getAddressByCoordinates(order.deliveryCoordinates)

		if (!order) {
			throw new NotFoundError(`there is no order with _id=${orderId}`)
		}
		checkPermission(req.user, order.user._id)

		res.status(StatusCodes.OK).json({
			msg: "get single by orderId",
			order,
			address: {
				street: street,
				isCustomAddress: order.isCustomCoordinates,
			},
		})
	} catch (error) {
		console.log(error)
	}
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
	// try {
	const { userId } = req.user
	const { orderId } = req.params

	console.log({ orderId })
	console.log(req.body)

	const order = await Orders.findOne({ _id: orderId })
	if (!order) {
		throw new NotFoundError(`there is no order with id=${orderId}`)
	}

	const allowed = [
		"status",
		"items",
		"shippingFee",
		"discounts",
		"deliveryCoordinates",
		"isCustomCoordinates",
	]

	for (const key in req.body) {
		if (!allowed.includes(key)) {
			throw new ForbiddenError(`not allowed to update ${key} field`)
		}
		if (key === "discounts") {
			checkDiscounts(req.body[key])
		}
		order[key] = req.body[key]
	}

	if (req.body.status === "paid") {
		const nowDate = Date.now()
		order.paidAt = nowDate
		order.items.forEach(async (item) => {
			const productId = item.product
			const newAction = { date: nowDate, user: userId ? userId : adminId }
			const newActions = Array(item.amount).fill(newAction)
			await Statistics.updateOne(
				{ product: productId },
				{ $push: { bought: { $each: newActions } } },
				{ upsert: true }
			)
		})
	}

	const { countedSubtotal, countedTotal } = await getCartDetails(order, next)
	order.total = countedTotal
	order.subtotal = countedSubtotal
	await order.save()

	await order.populate({
		path: "items.product",
		select: "title price description images",
	})

	res.status(StatusCodes.OK).json({
		msg: "update",
		order,
	})
	// } catch (error) {
	// 	console.log(error)
	// }
}

function checkDiscounts(newDiscounts) {
	const countMap = {}
	newDiscounts.forEach((disc) => {
		if (disc.name in countMap) {
			throw new BadRequestError(
				`Промокод можно применить только один раз`
			)
		} else {
			countMap[disc.name] = 1
		}
	})
}

const addToCart = async (req, res) => {
	const { orderId } = req.params
	const { productId, amount, items } = req.body
	console.log({ body: req.body })
	console.log({ items })
	const order = await Orders.findOne({
		_id: orderId,
	})
	if (!order) {
		throw new NotFoundError(`there is no order with id=${orderId}`)
	}

	let copyItems = [...order.items]

	if (Array.isArray(items)) {
		items.forEach(({ amount, product }) => {
			console.log("adding", { amount, product })
			copyItems = updateSingle(copyItems, amount, product._id)
		})
	} else {
		copyItems = updateSingle(copyItems, amount, productId)
	}

	order.items = copyItems
	console.log({ copyItems })
	const { countedSubtotal, countedTotal, amountTotal, itemsLength } =
		await getCartDetails(order)
	order.total = countedTotal
	order.subtotal = countedSubtotal
	order.amountTotal = amountTotal
	order.itemsLength = itemsLength

	await order.save()

	await order.populate({
		path: "items.product",
		select: "title price description images",
	})

	res.status(StatusCodes.OK).json({ msg: "added to cart", order })
}

function updateSingle(copyItems, amount, productId) {
	let isFound = false

	if (amount === 0) {
		copyItems = copyItems.filter(
			(item) => item.product.toString() !== productId
		)
	} else {
		for (let index = 0; index < copyItems.length; index++) {
			if (copyItems[index].product.toString() === productId) {
				copyItems[index].amount = amount
				isFound = true
				break
			}
		}

		if (!isFound) {
			copyItems.push({ product: productId, amount })
		}
	}
	return copyItems
}

const getCartDetails = async ({ items, shippingFee, discounts }) => {
	// try {
	let { countedSubtotal, amountTotal } = await items.reduce(
		async (agg, item) => {
			const foundItem = await Products.findOne({ _id: item.product })

			if (!foundItem) {
				throw new NotFoundError(`no such item with id ${item.product}`)
			}
			const prev = await agg
			return {
				countedSubtotal:
					prev?.countedSubtotal + foundItem.price * item.amount,
				amountTotal: prev.amountTotal + item.amount,
			}
		},
		{ amountTotal: 0, countedSubtotal: 0 }
	)
	let countedTotal = countedSubtotal + shippingFee

	discounts.forEach((discount) => {
		if (discount.type === "minus") {
			countedTotal -= discount.value
		}
	})

	discounts.forEach((discount) => {
		if (discount.type === "percentage") {
			countedTotal *= discount.value
		}
	})
	countedTotal = parseFloat(countedTotal.toFixed(2))
	countedSubtotal = parseFloat(countedSubtotal.toFixed(2))
	const itemsLength = items.length
	console.log({ countedTotal })
	if (countedTotal < 0) {
		console.log("throwing")
		throw new BadRequestError(`Для этого промокода хочу чек побольше =)`)
	}
	return {
		countedSubtotal,
		countedTotal,
		amountTotal,
		itemsLength,
	}
	// } catch (error) {
	// 	console.log(error)
	// }
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

const getCurrentUserCart = async (req, res) => {
	const { userId } = req.user

	const order = await Orders.findOne({
		user: userId,
		status: "cart",
	}).populate({
		path: "items.product",
		select: "title price description images",
	})

	if (!order) {
		throw new NotFoundError(
			`there is no \`cart\` order for user with id=${userId}`
		)
	}
	res.status(StatusCodes.OK).json({
		msg: "current",
		order,
	})
}

const createPaymentIntent = async (req, res, next) => {
	try {
		const { orderId } = req.body

		console.log("starting payment intent")

		const order = await Orders.findOne({
			_id: orderId,
		})
		console.log({ founddd: order })
		if (!order) {
			return new NotFoundError(`there is no order with id=${orderId}`)
		}
		const paymentIntent = await stripe.paymentIntents.create({
			amount: order.total * 100,
			currency: "usd",
			automatic_payment_methods: {
				enabled: true,
			},
		})

		order.clientSecret = paymentIntent.client_secret
		await order.save()

		res.status(StatusCodes.CREATED).json({
			order,
			msg: "client secret updated",
		})
	} catch (error) {
		console.log(error)
	}
}

const refundOrder = async (req, res) => {
	const { userId } = req.user
	const { orderId } = req.body

	const order = await Orders.findOne({
		_id: orderId,
	})
		.populate({
			path: "items.product",
			select: "title price description images ",
			populate: {
				path: "vendor",
				select: "firstName lastName username ",
			},
		})
		.populate({
			path: "user",
			select: "firstName lastName email phone",
		})

	if (!order) {
		return new NotFoundError(`there is no order with id=${orderId}`)
	}

	const payment_intent = order.clientSecret.split("_secret_")[0]
	const refund = await stripe.refunds.create({
		payment_intent,
		metadata: { orderId },
	})

	if (refund?.status === "succeeded") {
		order.refundId = refund.id
		order.status = "refunded"

		const nowDate = Date.now()
		order.refundedAt = nowDate
		order.items.forEach(async (item) => {
			const productId = item.product
			const newAction = { date: nowDate, user: userId ? userId : adminId }
			const newActions = Array(item.amount).fill(newAction)
			await Statistics.updateOne(
				{ product: productId },
				{ $push: { refunded: { $each: newActions } } },
				{ upsert: true }
			)
		})
	}
	console.log(refund)
	await order.save()

	res.status(StatusCodes.OK).json({
		msg: "refunded",
		order,
	})
}

module.exports = {
	getAllOrders,
	createOrder,
	deleteOrder,
	updateOrder,
	getCurrentUserCart,
	addToCart,
	createPaymentIntent,
	getSingleByPaymentSecret,
	getSingleByOrderId,
	getMyOrders,
	refundOrder,
}
