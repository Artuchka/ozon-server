const { Products } = require("../models/productModel")
const { populateDetails } = require("./populateDetails")

const vendorID = "63da5aeb225b9753f64b3910"
async function populateSingle(details) {
	console.log("creating product")
	const product = await Products.create({
		...details,
		vendor: vendorID,
	})
	console.log(product)
}

function populateDB() {
	populateDetails.map((item) => {
		populateSingle({
			...item,
			price: parseInt(
				item?.price?.replace(" ", "").replace(" ", "") || 228
			),
		})
	})
}

module.exports = { populateDB }
