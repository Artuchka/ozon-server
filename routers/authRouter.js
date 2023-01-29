const express = require("express")
const router = express.Router()
const {
	logout,
	login,
	register,
	loginJWT,
	loginPasswordless,
	registerPasswordless,
	verifyPasswordless,
} = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware")

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/logout").get(logout)

router.route("/loginJWT").get(authMiddleware(), loginJWT)

router.route("/login-passwordless").post(loginPasswordless)
router.route("/register-passwordless").post(registerPasswordless)
router.route("/verify-passwordless").post(verifyPasswordless)

module.exports = { authRouter: router }
