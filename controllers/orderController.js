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
const getSingleByPaymentSecret = async (req, res) => {
	const { paymentSecret } = req.params
	const order = await Orders.findOne({
		clientSecret: paymentSecret,
	}).populate({
		path: "items.product",
		select: "title price description images",
	})

	checkPermission(req.user, order.user)

	res.status(StatusCodes.OK).json({
		msg: "by payment secret",
		order,
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

// This is your test secret API key.
const stripe = require("stripe")(
	"sk_test_51MAxWLBjYPBxkDu0F5giJjXsQorKYBLkDrhVFdgCrdb7W140cucAxZlMNHCICf4pMik8Hq6wNoeQYphpBQreY1Rj00jCSyIBC4"
)

const updateOrder = async (req, res, next) => {
	try {
		const { userId } = req.user
		const { orderId } = req.params

		console.log({ orderId })
		console.log(req.body)

		const order = await Orders.findOne({ _id: orderId })
		if (!order) {
			throw new NotFoundError(`there is no order with id=${orderId}`)
		}

		const allowed = ["status", "items", "shippingFee", "discounts"]

		for (const key in req.body) {
			if (!allowed.includes(key)) {
				throw new ForbiddenError(`not allowed to update ${key} field`)
			}
			order[key] = req.body[key]
		}

		const { countedSubtotal, countedTotal } = await getCartDetails(
			order,
			next
		)
		order.total = countedTotal
		order.subtotal = countedSubtotal
		await order.save()

		// idk really. mb it should be here
		// await order.populate({
		// 	path: "items.product",
		// 	select: "title price description images",
		// })

		res.status(StatusCodes.OK).json({
			msg: "update",
			order,
		})
	} catch (error) {
		console.log(error)
	}
}

const addToCart = async (req, res, next) => {
	const { orderId } = req.params
	const { productId, amount } = req.body

	const order = await Orders.findOne({
		_id: orderId,
	})
	if (!order) {
		throw new NotFoundError(`there is no order with id=${orderId}`)
	}

	let copyItems = [...order.items]
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

	order.items = copyItems

	const { countedSubtotal, countedTotal, amountTotal, itemsLength } =
		await getCartDetails(order, next)
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

const getCartDetails = async ({ items, shippingFee, discounts }, next) => {
	let { countedSubtotal, amountTotal } = await items.reduce(
		async (agg, item) => {
			const foundItem = await Products.findOne({ _id: item.product })
			if (!foundItem) {
				return next(
					new NotFoundError(`no such item with id ${item.product}`)
				)
			}
			const prev = await agg
			return {
				countedSubtotal:
					prev.countedSubtotal + foundItem.price * item.amount,
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

	return {
		countedSubtotal,
		countedTotal,
		amountTotal,
		itemsLength,
	}
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

	console.log({ order })
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

module.exports = {
	getAllOrders,
	createOrder,
	deleteOrder,
	updateOrder,
	getCurrentUserCart,
	addToCart,
	createPaymentIntent,
	getSingleByPaymentSecret,
}
