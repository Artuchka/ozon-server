const path = require("path")
const fs = require("fs")
const { adsSources } = require("./adsSources")

const generateAds = ({
	long = 1,
	short = 1,
	half = 1,
	category = 1,
	longTall = 4,
}) => {
	const ads = { long: [], short: [], half: [], category: [], longTall: [] }

	const longFiles = adsSources["same-site"].long
	const shortFiles = adsSources["same-site"].short
	const categoryFiles = adsSources["same-site"].categories
	const halfFiles = adsSources.outsource.half
	const longTallFiles = adsSources.outsource["long-tall"]

	shuffle(longFiles)
	shuffle(shortFiles)
	shuffle(categoryFiles)
	shuffle(halfFiles)
	shuffle(longTallFiles)

	for (let i = 0; i < long && longFiles.length > i; i++) {
		const newAd = generateAd(longFiles[i])
		ads.long.push(newAd)
	}
	for (let i = 0; i < short && shortFiles.length > i; i++) {
		const newAd = generateAd(shortFiles[i])
		ads.short.push(newAd)
	}
	for (let i = 0; i < half && halfFiles.length > i; i++) {
		const newAd = generateAd(halfFiles[i])
		ads.half.push(newAd)
	}
	for (let i = 0; i < category && categoryFiles.length > i; i++) {
		const newAd = generateAd(categoryFiles[i])
		ads.category.push(newAd)
	}
	for (let i = 0; i < longTall && longTallFiles.length > i; i++) {
		const newAd = generateAd(longTallFiles[i])
		ads.longTall.push(newAd)
	}

	// shuffle(ads.long)
	// shuffle(ads.short)
	// shuffle(ads.category)
	// shuffle(ads.longTall)
	// shuffle(ads.half)
	return ads
}

function generateAd(src, redirect = "/products") {
	return { src, url: redirect }
}
function shuffle(array) {
	let currentIndex = array.length
	let randomIndex = 0

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex--
		;[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		]
	}

	return array
}

module.exports = { generateAds }
