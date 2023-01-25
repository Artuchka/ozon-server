const mongoose = require("mongoose")

const SingleProductOrderSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: true,
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
})

const DiscountSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: {
			values: ["percentage", "minus"],
			message: "{VALUE} is not supported for discount type",
		},
		required: true,
	},
	value: {
		type: Number,
		required: true,
	},
	name: {
		type: String,
		required: true,
		default: "Название скидки",
	},
})

const OrderSchema = new mongoose.Schema(
	{
		items: {
			type: [SingleProductOrderSchema],
			default: [],
			required: true,
		},
		subtotal: {
			type: Number,
			default: 0,
			required: true,
		},

		shippingFee: {
			type: Number,
			default: 0,
			required: true,
		},
		discounts: {
			type: [DiscountSchema],
			default: [],
			required: false,
		},
		total: {
			type: Number,
			default: 0,
			required: true,
		},
		amountTotal: {
			type: Number,
			default: 0,
			required: true,
		},
		itemsLength: {
			type: Number,
			default: 0,
			required: true,
		},
		deliveryCoordinates: {
			type: [Number, Number],
			required: true,
			default: [0, 0],
		},
		clientSecret: {
			type: String,
			default: "placeholder",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: {
				values: ["cart", "checkout", "pending", "paid", "delievered"],
				message: "{VALUE} is not supported for order status",
			},
			required: true,
		},
		paidAt: {
			type: Date,
		},
	},
	{ timestamps: true }
)

const Orders = new mongoose.model("Order", OrderSchema)

module.exports = { Orders }

// ex: [{type: 'percentage',name: 'Just for charity', value: 0.9}
// 		,{type: 'percentage',name: 'Just for charity', value: 0.9},
// 		,{type: 'minus',name: 'Just for charity', value: 300}]
// title: {
// 	type: String,
// 	required: true,
// },
// price: {
// 	type: Number,
// 	required: true,
// },
// image: {
// 	type: String,
// 	required: true,
// },
