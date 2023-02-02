const { StatusCodes } = require("http-status-codes")
const { Users } = require("../models/userModel")
const { BadRequestError, NotFoundError } = require("../errors/customError")
const { attachCookies, clearCookies } = require("../utils/cookies")
const { createUserToken, verifyToken } = require("../utils/jwt")
const { Orders } = require("../models/orderModel")
const { sendEmail } = require("../utils/mailer")

const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new BadRequestError("Пожалуйста предоставьте почту и пароль")
	}

	const foundUser = await Users.findOne({ email })
	if (!foundUser) {
		throw new NotFoundError(
			`Пользователь с почтой ${email} не зарегестрирован`
		)
	}

	const isValidPassword = await foundUser.comparePassword(password)
	if (!isValidPassword) {
		throw new BadRequestError(`Неверные данные`)
	}

	const token = createUserToken({ user: foundUser })
	attachCookies({ res, token })
	res.status(StatusCodes.OK).json({
		msg: "Давно не виделись :D",
		user: foundUser,
	})
}
const loginJWT = async (req, res) => {
	const id = req?.user?.userId

	const foundUser = await Users.findOne({ _id: id })
	if (!foundUser) {
		throw new NotFoundError(`Нет пользователя с id = ${id}`)
	}

	const token = createUserToken({ user: foundUser })
	attachCookies({ res, token })

	res.status(StatusCodes.OK).json({
		msg: "Давно не виделись :D",
		user: foundUser,
	})
}

const register = async (req, res) => {
	const { email, password } = req.body

	const createdUser = await Users.create({ email, password })
	const cartForUser = await Orders.create({
		user: createdUser._id,
		status: "cart",
	})

	res.status(StatusCodes.OK).json({
		msg: `Зарегистрировали ${email}`,
		createdUser,
		cartForUser,
	})
}

const loginPasswordless = async (req, res) => {
	const { email } = req.body

	const foundUser = await Users.findOne({ email })
	if (!foundUser) {
		throw new NotFoundError(`Нет пользователя с почтой ${email}`)
	}
	const verifyToken = createUserToken({
		user: foundUser,
	})
	foundUser.verifyToken = verifyToken
	console.log({ verifyToken })
	await foundUser.save()

	// sending email
	sendEmail({ emailTo: email, token: verifyToken })

	res.status(StatusCodes.OK).json({
		msg: `Проверьте вашу почту (${email})! Мы отправили письмо =)`,
	})
}
const registerPasswordless = async (req, res) => {
	const { email } = req.body

	const createdUser = await Users.create({ email })
	const verifyToken = createUserToken({
		user: { firstName: "new user", _id: createdUser._id, role: "user" },
	})
	createdUser.verifyToken = verifyToken
	await createdUser.save()
	console.log({ verifyToken })

	const cartForUser = await Orders.create({
		user: createdUser._id,
		status: "cart",
	})

	// sending email
	sendEmail({ emailTo: email, token: verifyToken })

	res.status(StatusCodes.OK).json({
		msg: `Проверьте вашу почту (${email})! Мы отправили письмо =)`,
	})
}
const verifyPasswordless = async (req, res) => {
	const { token } = req.body

	const user = await Users.findOne({ verifyToken: token })
	if (!user) {
		throw new NotFoundError(`Нет пользователя с токеном = ${token}`)
	}

	const decoded = verifyToken(token)
	if (decoded.userId !== user._id.toString()) {
		throw new BadRequestError(`У Вас плохие 🍪кукисы🍪...`)
	}

	user.isVerifiedEmail = true
	user.verifyToken = "placeholder"
	await user.save()

	const cartForUser = await Orders.findOne({
		user: user._id,
		status: "cart",
	})

	attachCookies({ res, token })

	res.status(StatusCodes.OK).json({
		msg: "Давно не виделись :D",
		user,
		cartForUser,
	})
}

const logout = async (req, res) => {
	clearCookies({ res })
	res.status(StatusCodes.OK).json({
		msg: "До скорых встреч!",
	})
}

module.exports = {
	login,
	logout,
	register,
	loginJWT,
	loginPasswordless,
	registerPasswordless,
	verifyPasswordless,
}
