const { StatusCodes } = require("http-status-codes")

const notFoundMiddleware = async (req, res) => {
	res.status(StatusCodes.NOT_FOUND).json({
		msg: "Unsupported Route =(",
	})
}

module.exports = { notFoundMiddleware }
