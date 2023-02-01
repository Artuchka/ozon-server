const { StatusCodes } = require("http-status-codes")
const { Users } = require("../models/userModel")
const {
	NotFoundError,
	ForbiddenError,
	BadRequestError,
} = require("../errors/customError")
const { checkPermission } = require("../utils/checkPermission")
const { createUserToken } = require("../utils/jwt")
const { attachCookies } = require("../utils/cookies")

const getAllUsers = async (req, res) => {
	const users = await Users.find()

	res.status(StatusCodes.OK).json({
		msg: "get all",
		users,
	})
}

const getSingleUser = async (req, res) => {
	const { id } = req.params
	const foundUser = await Users.findOne({ _id: id }).select("-password")
	if (!foundUser) {
		throw new NotFoundError(`no user with id=${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "get single",
		user: foundUser,
	})
}

const getCurrentUser = async (req, res) => {
	const { userId } = req.user
	const foundUser = await Users.findOne({ _id: userId }).select("-password")
	if (!foundUser) {
		throw new NotFoundError(`no user with id=${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "get getCurrentUser",
		user: foundUser,
	})
}

const updateUser = async (req, res) => {
	const { userId: id } = req.user
	const foundUser = await Users.findOne({ _id: id })
	if (!foundUser) {
		throw new NotFoundError(`no user with id=${id}`)
	}
	checkPermission(req.user, id)

	const allowed = [
		"username",
		"firstName",
		"lastName",
		"phone",
		"gender",
		"birthday",
		"location",
		"email",
		"avatar",
	]

	Object.keys(req.body).forEach((key) => {
		if (allowed.includes(key)) {
			foundUser[key] = req.body[key]
		} else {
			throw new ForbiddenError(
				`it's forbidden to update \`${key}\` value`
			)
		}
	})
	await foundUser.save()

	res.status(StatusCodes.OK).json({
		msg: "updateUser",
		user: foundUser,
	})
}

const updateUserPassword = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "updateUserPassword",
	})
}

const deleteUser = async (req, res) => {
	const { id } = req.params
	checkPermission(req.user, id)

	const deletedUser = await Users.findOneAndDelete({ _id: id })
	if (!deletedUser) {
		throw new NotFoundError(`no user with id=${id}`)
	}

	res.status(StatusCodes.OK).json({
		msg: "deleteUser",
		user: deletedUser,
	})
}

const becomeVendor = async (req, res) => {
	const { userId } = req.user
	const foundUser = await Users.findOne({ _id: userId })
	if (!foundUser) {
		throw new NotFoundError(`no user with id=${userId}`)
	}
	if (foundUser.role === "vendor") {
		throw new BadRequestError(
			`user with id=${userId} is already a \`vendor\``
		)
	}

	foundUser.role = "vendor"
	await foundUser.save()

	res.status(StatusCodes.OK).json({
		msg: "congrats! you are vendor now",
		user: foundUser,
	})
}

module.exports = {
	updateUser,
	deleteUser,
	updateUserPassword,
	getSingleUser,
	getAllUsers,
	getCurrentUser,
	becomeVendor,
}
