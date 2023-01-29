const { StatusCodes } = require("http-status-codes")
const { Users } = require("../models/userModel")
const { BadRequestError, NotFoundError } = require("../errors/customError")
const { attachCookies, clearCookies } = require("../utils/cookies")
const { createUserToken } = require("../utils/jwt")
const { Orders } = require("../models/orderModel")
const { sendEmail } = require("../utils/mailer")

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
const loginPasswordless = async (req, res) => {
	// const id = req?.user?.userId

	// const foundUser = await Users.findOne({ _id: id })
	// if (!foundUser) {
	// 	throw new NotFoundError(`no user with id = ${id}`)
	// }

	// const token = createUserToken({ user: foundUser })
	// attachCookies({ res, token })

	res.status(StatusCodes.OK).json({
		msg: "welcome back, passworless",
		// user: foundUser,
	})
}

const register = async (req, res) => {
	const { email, password } = req.body

	const createdUser = await Users.create({ email, password })
	const cartForUser = await Orders.create({
		user: createdUser._id,
		status: "cart",
	})

	// email verification

	res.status(StatusCodes.OK).json({
		msg: "registered!",
		createdUser,
		cartForUser,
	})
}
const registerPasswordless = async (req, res) => {
	try {
		const { email, password } = req.body

		// const createdUser = await Users.create({ email })
		// const cartForUser = await Orders.create({
		// 	user: createdUser._id,
		// 	status: "cart",
		// })

		// sending email
		sendEmail({ emailTo: email })

		res.status(StatusCodes.OK).json({
			msg: "email sent!",
			// createdUser,
			// cartForUser,
		})
	} catch (error) {
		console.log(error)
	}
}

const logout = async (req, res) => {
	clearCookies({ res })
	res.status(StatusCodes.OK).json({
		msg: "see you soon",
	})
}

module.exports = {
	login,
	logout,
	register,
	loginJWT,
	loginPasswordless,
	registerPasswordless,
}
