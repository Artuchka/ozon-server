const { UnauthError } = require("../errors/customError")

const checkPermission = (reqUser, resUserId) => {
	if (
		reqUser?.role !== "admin" &&
		reqUser?.userId?.toString() !== resUserId?.toString()
	)
		throw new UnauthError(
			`you are not allowed to access this route, ${reqUser?.userId} !== ${resUserId}`
		)
}

module.exports = { checkPermission }
