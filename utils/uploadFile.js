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
cloudinary.config({
	secure: true,
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
	api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
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
