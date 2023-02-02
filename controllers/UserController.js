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
		msg: "Все пользователи!",
		users,
	})
}

const getSingleUser = async (req, res) => {
	const { id } = req.params
	const foundUser = await Users.findOne({ _id: id }).select("-password")
	if (!foundUser) {
		throw new NotFoundError(`Нет юзера с id=${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "Отдельный юзер!",
		user: foundUser,
	})
}

const getCurrentUser = async (req, res) => {
	const { userId } = req.user
	const foundUser = await Users.findOne({ _id: userId }).select("-password")
	if (!foundUser) {
		throw new NotFoundError(`Нет юзера с id ${id}`)
	}
	res.status(StatusCodes.OK).json({
		msg: "Текущий пользователь!",
		user: foundUser,
	})
}

const updateUser = async (req, res) => {
	const { userId: id } = req.user
	const foundUser = await Users.findOne({ _id: id })
	if (!foundUser) {
		throw new NotFoundError(`Нет юзера с id ${id}`)
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
				`😡Запрещенно обновлять поле \`${key}\` у пользователя😡`
			)
		}
	})
	await foundUser.save()

	res.status(StatusCodes.OK).json({
		msg: "Обновили данные!",
		user: foundUser,
	})
}

const updateUserPassword = async (req, res) => {
	res.status(StatusCodes.OK).json({
		msg: "Обновили пароль!",
	})
}

const deleteUser = async (req, res) => {
	const { id } = req.params
	checkPermission(req.user, id)

	const deletedUser = await Users.findOneAndDelete({ _id: id })
	if (!deletedUser) {
		throw new NotFoundError(`Нет юзера с id ${id}`)
	}

	res.status(StatusCodes.OK).json({
		msg: "➖Удалили пользователя!➖",
		user: deletedUser,
	})
}

const becomeVendor = async (req, res) => {
	const { userId } = req.user
	const foundUser = await Users.findOne({ _id: userId })
	if (!foundUser) {
		throw new NotFoundError(`Нет юзера с id ${userId}`)
	}
	if (foundUser.role === "vendor") {
		throw new BadRequestError(`Юзер с id ${userId} уже 💸продавец💸`)
	}

	foundUser.role = "vendor"
	await foundUser.save()

	res.status(StatusCodes.OK).json({
		msg: "Поздравляем! Вы теперь 💸продавец💸",
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
