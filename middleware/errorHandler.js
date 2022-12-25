const { StatusCodes } = require("http-status-codes")

const errorHandlerMiddleware = async (err, req, res, next) => {
	const error = {
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		message: err.message,
	}
	if (err?.code === 11000) {
		error.statusCode = StatusCodes.BAD_REQUEST
		const keys = Object.keys(err?.keyValue)
		if (keys.length === 2) {
			if (keys.includes("user") && keys.includes("product")) {
				error.message = "Я уже в закладках!"
			} else {
				error.message = "Вы уже оставили отзыв!"
			}
		} else {
			const key = [0]
			error.message = `${key} \`${err?.keyValue?.[key]}\` already registered`
		}
	}
	if (err?.name === "JsonWebTokenError") {
		error.statusCode = StatusCodes.BAD_REQUEST
	}
	if (err?.name === "CastError") {
		error.statusCode = StatusCodes.BAD_REQUEST
	}

	res.status(error.statusCode).json({
		msg: error.message,
		err,
	})
}

module.exports = { errorHandlerMiddleware }
