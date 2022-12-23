const { StatusCodes } = require("http-status-codes")
const { Users } = require("../models/userModel")
const { BadRequestError, NotFoundError } = require("../errors/customError")
const { attachCookies, clearCookies } = require("../utils/cookies")
const { createUserToken } = require("../utils/jwt")

const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new BadRequestError("please provide email and password")
	}

	const foundUser = await Users.findOne({ email })
	if (!foundUser) {
		throw new NotFoundError(`no user with email = ${email}`)
	}

	const isValidPassword = await foundUser.comparePassword(password)
	if (!isValidPassword) {
		throw new BadRequestError(`invalid credentials`)
	}

	const token = createUserToken({ user: foundUser })
	attachCookies({ res, token })
	res.status(StatusCodes.OK).json({
		msg: "welcome back",
		user: foundUser,
	})
}
const loginJWT = async (req, res) => {
	const id = req?.user?.userId

	const foundUser = await Users.findOne({ _id: id })
	if (!foundUser) {
		throw new NotFoundError(`no user with id = ${id}`)
	}

	const token = createUserToken({ user: foundUser })
	attachCookies({ res, token })

	res.status(StatusCodes.OK).json({
		msg: "welcome back",
		user: foundUser,
	})
}

const register = async (req, res) => {
	const { email, password } = req.body

	const createdUser = await Users.create({ email, password })

	// email verification

	res.status(StatusCodes.OK).json({
		msg: "registered!",
		createdUser,
	})
}

const logout = async (req, res) => {
	clearCookies({ res })
	res.status(StatusCodes.OK).json({
		msg: "see you soon",
	})
}

module.exports = { login, logout, register, loginJWT }
