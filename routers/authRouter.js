const express = require("express")
const router = express.Router()
const {
	logout,
	login,
	register,
	loginJWT,
} = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware")

router.route("/login").post(login)
router.route("/loginJWT").get(authMiddleware(), loginJWT)
router.route("/register").post(register)
router.route("/logout").get(logout)

module.exports = { authRouter: router }
