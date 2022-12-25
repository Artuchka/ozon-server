const express = require("express")
const {
	getAllBookmarks,
	addBookmark,
	deleteBookmark,
} = require("../controllers/bookmarkController")
const router = express.Router()

router.route("/").get(getAllBookmarks).post(addBookmark).delete(deleteBookmark)

module.exports = { bookmarkRouter: router }
