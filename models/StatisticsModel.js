const { Schema, SchemaType, SchemaTypes, model } = require("mongoose")

const ActionDetailSchema = new Schema({
	date: {
		type: Date,
		required: true,
	},
	user: {
		type: SchemaTypes.ObjectId,
		ref: "User",
		required: true,
	},
})

const StatisticsSchema = new Schema({
	product: {
		type: SchemaTypes.ObjectId,
		ref: "Product",
		required: true,
		unique: true,
	},
	visits: {
		type: [ActionDetailSchema],
		default: [],
		required: true,
	},
	bought: {
		type: [ActionDetailSchema],
		default: [],
		required: true,
	},
	returned: {
		type: [ActionDetailSchema],
		default: [],
		required: true,
	},
})

const Statistics = new model("Statistics", StatisticsSchema)

module.exports = { Statistics }
