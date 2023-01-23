const path = require("path")
const CyrillicToTranslit = require("cyrillic-to-translit-js")
const cyrillicToTranslit = new CyrillicToTranslit()

const uploadFile = (file, type, maxSize) => {
	let regex = /image\//
	if (type === "video") {
		regex = /video\//
	}
	if (!file?.mimetype?.match(regex)) {
		throw new BadRequestError(`please provide ${type} only`)
	}
	if (file?.size > maxSize) {
		throw new BadRequestError(
			`the image is too big, send only up to ${
				maxSize / 1024 / 1024
			} MB = ${maxSize} bytes`
		)
	}

	const translatedName = cyrillicToTranslit
		.transform(file.name, "_")
		.toLowerCase()

	const nameHashed = file.md5
	const dotIndex = translatedName.lastIndexOf(".")

	const nameWithHash =
		translatedName.substring(0, dotIndex) +
		"=" +
		nameHashed +
		translatedName.substring(dotIndex)

	const uploadPath = `/uploads/${type}/${nameWithHash}`

	file.mv(path.join(__dirname, "../public", uploadPath), (err) => {
		if (err) {
			console.log(err)
		} else {
			console.log(`uploaded ${type}`)
		}
	})
	return uploadPath
}

module.exports = { uploadFile }
