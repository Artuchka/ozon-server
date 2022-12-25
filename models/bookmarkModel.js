const { Schema, SchemaTypes, model } = require("mongoose")

const BookmarkSchema = new Schema({
	product: {
		type: SchemaTypes.ObjectId,
		ref: "Product",
		required: [true, "please provide product to bookmark"],
	},
	user: {
		type: SchemaTypes.ObjectId,
		ref: "User",
		required: [true, "please provide user who bookmarks"],
	},
})

BookmarkSchema.index({ user: 1, product: 1 }, { unique: true })

const Bookmarks = new model("Bookmark", BookmarkSchema)
module.exports = { Bookmarks }
