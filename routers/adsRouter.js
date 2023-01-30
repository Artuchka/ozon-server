const express = require("express")
const { getAds } = require("../controllers/adsController")
const router = express.Router()

router.route("/").post(getAds)

module.exports = { adsRouter: router }
