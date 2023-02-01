const { Products } = require("../models/productModel")
const { populateDetails } = require("./populateDetails")

const vendorID = "63d7f9fa780f2eefbe5f87d8"
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
