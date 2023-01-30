const path = require("path")
const CyrillicToTranslit = require("cyrillic-to-translit-js")
const cyrillicToTranslit = new CyrillicToTranslit()

const uploadFileLocal = (file, type, maxSize) => {
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

const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const { log } = require("console")
cloudinary.config({
	secure: true,
	cloud_name: "dzy8xh83i",
	api_key: "617847489894368",
	api_secret: "vLY0UkWpAoQRjxWJmgAZ3oqB4oY",
})

const uploadFileToCloud = async (file, type, maxSize) => {
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

	const result = await uploadToCloud(file, type)
	console.log({ result })

	return result
}

async function uploadToCloud(file, type) {
	try {
		return await new Promise((resolve, reject) => {
			let stream = cloudinary.uploader.upload_stream(
				{ folder: "OZON", resource_type: type },
				(error, result) => {
					if (result) {
						resolve(result)
					} else {
						reject(error)
					}
				}
			)

			streamifier.createReadStream(file.data).pipe(stream)
		})
	} catch (error) {
		console.log(error)
	}
}

module.exports = { uploadFileLocal, uploadFileToCloud }
