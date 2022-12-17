const mongoose = require("mongoose")

const SingleProductOrderSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
})

const OrderSchema = new mongoose.Schema({
	tax: {
		type: Number,
		default: 0,
		required: true,
	},
	shippingFee: {
		type: Number,
		default: 0,
		required: true,
	},
	subtotal: {
		type: Number,
		default: 0,
		required: true,
	},
	total: {
		type: Number,
		default: 0,
		required: true,
	},
	items: {
		type: [SingleProductOrderSchema],
		default: [],
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true,
	},
	status: {
		type: String,
		enum: {
			values: ["checkout", "pending", "paid"],
			message: "{VALUE} is not supported for order status",
		},
		default: "checkout",
	},
})

const Orders = new mongoose.model("Order", OrderSchema)

module.exports = { Orders }
