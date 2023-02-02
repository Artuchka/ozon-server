const { StatusCodes } = require("http-status-codes")
const { generateAds } = require("../utils/generateAds")

const getAds = async (req, res) => {
	let { adsConfig } = req.body

	const ads = generateAds(adsConfig)

	res.status(StatusCodes.OK).json({
		msg: "Реклама",
		ads,
	})
}

module.exports = { getAds }
