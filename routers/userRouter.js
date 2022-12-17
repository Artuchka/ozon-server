const express = require("express")
const router = express.Router()
const {
	getAllUsers,
	getSingleUser,
	updateUser,
	deleteUser,
	getCurrentUser,
	updateUserPassword,
	becomeVendor,
} = require("../controllers/UserController")
const { roleMiddleware } = require("../middleware/authMiddleware")

router.route("/").get(roleMiddleware("admin"), getAllUsers).patch(updateUser)

router.route("/showMe").get(getCurrentUser)
router.route("/becomeVendor").get(becomeVendor)
router.route("/updatePassword").patch(updateUserPassword)

router
	.route("/:id")
	.get(roleMiddleware("admin"), getSingleUser)
	.delete(deleteUser)

module.exports = { userRouter: router }
