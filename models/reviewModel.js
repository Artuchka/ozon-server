const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		comment: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

ReviewSchema.index({ author: 1, product: 1 }, { unique: true })

const Reviews = new mongoose.model("Review", ReviewSchema)

module.exports = { Reviews }
