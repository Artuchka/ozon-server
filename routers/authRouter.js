const express = require("express")
const router = express.Router()
const { logout, login, register } = require("../controllers/authController")

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/logout").get(logout)

module.exports = { authRouter: router }
