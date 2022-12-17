const jwt = require("jsonwebtoken")

const createUserToken = ({ user }) => {
	const { firstName, _id: userId, role } = user
	const userToken = { firstName, userId, role }
	const coded = jwt.sign(userToken, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_LIFETIME,
	})
	return coded
}

const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { verifyToken, createUserToken }
