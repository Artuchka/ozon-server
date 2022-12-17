const { UnauthError } = require("../errors/customError")

const checkPermission = (reqUser, resUserId) => {
	if (reqUser.role !== "admin" && reqUser.userId !== resUserId)
		throw new UnauthError(`you are not allowed to access this route`)
}

module.exports = { checkPermission }
