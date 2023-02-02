const { UnauthError } = require("../errors/customError")

const checkPermission = (reqUser, resUserId) => {
	if (
		reqUser?.role !== "admin" &&
		reqUser?.userId?.toString() !== resUserId?.toString()
	)
		throw new UnauthError(
			`Вам нельзя на этот route, ${reqUser?.userId} !== ${resUserId}`
		)
}

module.exports = { checkPermission }
