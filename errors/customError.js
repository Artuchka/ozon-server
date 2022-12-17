const { StatusCodes } = require("http-status-codes")

class CustomError extends Error {
	constructor(code, message) {
		super(message)
		this.statusCode = code
	}
}

class BadRequestError extends CustomError {
	constructor(message) {
		super(StatusCodes.BAD_REQUEST, message)
	}
}

class NotFoundError extends CustomError {
	constructor(message) {
		super(StatusCodes.NotFoundError, message)
	}
}

class UnauthError extends CustomError {
	constructor(message) {
		super(StatusCodes.UNAUTHORIZED, message)
	}
}
class ForbiddenError extends CustomError {
	constructor(message) {
		super(StatusCodes.FORBIDDEN, message)
	}
}

module.exports = {
	CustomError,
	UnauthError,
	ForbiddenError,
	BadRequestError,
	NotFoundError,
}
