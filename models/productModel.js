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
		companies: {
			type: [String],
			required: true,
			default: ["samsung"],
		},
		categories: {
			type: [String],
			required: true,
			default: ["техника"],
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
		numOfReviews: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
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
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

ProductSchema.methods.getDetails = function () {
	return 3
}
ProductSchema.virtual("reviews", {
	ref: "Review",
	foreignField: "product",
	localField: "_id",
	justOne: false,
})

ProductSchema.virtual("imagesCount").get(function () {
	return this.images.length
})
// ProductSchema.virtual("reviews").get(async function () {
// 	return await this.model("Review").find({ product: this._id })
// })

const Products = new mongoose.model("Product", ProductSchema)
module.exports = { Products }
