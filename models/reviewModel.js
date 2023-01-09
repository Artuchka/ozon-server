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
		images: {
			type: [String],
			default: [],
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

ReviewSchema.statics.calculateAverage = async function (productId) {
	const totals = (
		await this.aggregate([
			{ $match: { product: productId } },
			{
				$group: {
					_id: "the same id adds up results(ex: there are different users who reviewed the product and can be separated with _id:'$author')",
					numOfReviews: { $sum: 1 },
					averageRating: { $avg: "$rating" },
				},
			},
		])
	)?.[0]
	await this.model("Product").findOneAndUpdate(
		{ _id: productId },
		{
			averageRating: totals?.averageRating?.toFixed(2),
			numOfReviews: totals?.numOfReviews,
		}
	)
}

ReviewSchema.post("save", function () {
	Reviews.calculateAverage(this.product)
})
ReviewSchema.post("remove", function () {
	Reviews.calculateAverage(this.product)
})

const Reviews = new mongoose.model("Review", ReviewSchema)

module.exports = { Reviews }
