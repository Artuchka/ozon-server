const { StatusCodes } = require("http-status-codes")
const { generateAds } = require("../utils/generateAds")

const getAds = async (req, res) => {
	let { adsConfig } = req.body

	const ads = generateAds(adsConfig)

	res.status(StatusCodes.OK).json({
		msg: "here are u ads",
		ads,
	})
}

module.exports = { getAds }
