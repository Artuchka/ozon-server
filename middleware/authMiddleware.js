const { verifyToken } = require("../utils/jwt")

const authMiddleware = async (req, res, next) => {
	console.log(req.signedCookies)
	console.log(req.cookies)
	const { token } = req.cookies

	const decoded = verifyToken(token)
	console.log(decoded)
	req.user = decoded
	next()
}

const { ForbiddenError } = require("../errors/customError")

const roleMiddleware = (...allowed) => {
	return async (req, res, next) => {
		const { role } = req.user
		console.log(`role is ${role}`)
		if (role === "admin" || allowed.includes(role)) {
			return next()
		}

		throw new ForbiddenError("You are not allowed to access this route")
	}
}

module.exports = { authMiddleware, roleMiddleware }
