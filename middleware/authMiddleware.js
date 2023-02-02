const { verifyToken } = require("../utils/jwt")
const { UnauthError } = require("../errors/customError")

const authMiddleware = ({ isOptional } = { isOptional: false }) => {
	return async (req, res, next) => {
		// console.log(req.signedCookies)
		// console.log(req.cookies)
		try {
			const { token } = req.cookies

			if (!token) {
				throw new UnauthError(`Залогинься, друг!`)
			}
			const decoded = verifyToken(token)

			// console.log({ decoded })
			req.user = decoded
			next()
		} catch (error) {
			if (isOptional) {
				console.log("returning cuz optional")
				return next()
			}
			throw error
		}
	}
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
