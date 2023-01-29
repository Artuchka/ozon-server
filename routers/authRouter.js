const express = require("express")
const router = express.Router()
const {
	logout,
	login,
	register,
	loginJWT,
	loginPasswordless,
	registerPasswordless,
} = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware")

router.route("/login").post(login)
router.route("/loginJWT").get(authMiddleware(), loginJWT)
router.route("/login-passwordless").post(loginPasswordless)
router.route("/register").post(register)
router.route("/register-passwordless").post(registerPasswordless)
router.route("/logout").get(logout)

module.exports = { authRouter: router }
