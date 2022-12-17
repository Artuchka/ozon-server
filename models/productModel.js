const mongoose = require("mongoose")

const SpecSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
	link: {
		type: String,
	},
})
const ProductSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxlength: [100, "please trim title up to 100 characters"],
			unique: true,
		},
		description: {
			type: String,
			required: true,
			maxlength: [1000, "please trim description up to 1000 characters"],
		},
		price: {
			type: Number,
			required: true,
		},
		types: {
			type: [String],
			required: true,
			default: ["black", "yellow"],
		},
		tags: {
			type: [String],
			required: true,
			default: ["product tag"],
		},
		images: {
			type: [String],
			required: true,
			default: [""],
		},
		averageRating: {
			type: Number,
			required: true,
			default: 5,
			min: 1,
			max: 5,
		},
		reviews: {
			type: [mongoose.Schema.Types.ObjectId],
		},
		specs: {
			type: [SpecSchema],
		},
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

const Products = new mongoose.model("Product", ProductSchema)
module.exports = { Products }
