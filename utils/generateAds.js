const path = require("path")
const fs = require("fs")

const generateAds = ({
	long = 1,
	short = 1,
	half = 1,
	category = 1,
	longTall = 4,
}) => {
	const ads = { long: [], short: [], half: [], category: [], longTall: [] }

	const baseAdsURL = "/uploads/image/ads"

	const longBase = `${baseAdsURL}/SameSite/long/`
	const longSrc = path.join(__dirname, "..", `public/${longBase}`)
	const longFiles = fs.readdirSync(longSrc)

	const shortBase = `${baseAdsURL}/SameSite/short/`
	const shortSrc = path.join(__dirname, "..", `public/${shortBase}`)
	const shortFiles = fs.readdirSync(shortSrc)

	const categoryBase = `${baseAdsURL}/SameSite/categories/`
	const categorySrc = path.join(__dirname, "..", `public/${categoryBase}`)
	const categoryFiles = fs.readdirSync(categorySrc)

	const halfBase = `${baseAdsURL}/outsource/half/`
	const halfSrc = path.join(__dirname, "..", `public/${halfBase}`)
	const halfFiles = fs.readdirSync(halfSrc)

	const longTallBase = `${baseAdsURL}/outsource/long-tall/`
	const longTallSrc = path.join(__dirname, "..", `public/${longTallBase}`)
	const longTallFiles = fs.readdirSync(longTallSrc)

	for (let i = 0; i < long && longFiles.length > i; i++) {
		const newAd = generateAd(longBase, longFiles[i])
		ads.long.push(newAd)
	}
	for (let i = 0; i < short && shortFiles.length > i; i++) {
		const newAd = generateAd(shortBase, shortFiles[i])
		ads.short.push(newAd)
	}
	for (let i = 0; i < half && halfFiles.length > i; i++) {
		const newAd = generateAd(halfBase, halfFiles[i])
		ads.half.push(newAd)
	}
	for (let i = 0; i < category && categoryFiles.length > i; i++) {
		const newAd = generateAd(categoryBase, categoryFiles[i])
		ads.category.push(newAd)
	}
	for (let i = 0; i < longTall && longTallFiles.length > i; i++) {
		const newAd = generateAd(longTallBase, longTallFiles[i])
		ads.longTall.push(newAd)
	}

	shuffle(ads.long)
	shuffle(ads.short)
	shuffle(ads.category)
	shuffle(ads.longTall)
	shuffle(ads.half)
	return ads
}

function generateAd(baseURL, filename) {
	return { src: `${baseURL}${filename}`, url: "/products" }
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
