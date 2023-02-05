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
const { minifyImage } = require("./minifiyImage")
const { BadRequestError } = require("../errors/customError")
cloudinary.config({
	secure: true,
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
	api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
})

const uploadToCloud = async (file, type, maxSize) => {
	let regex = /image\//
	if (type === "video") {
		regex = /video\//
	}
	if (!file?.mimetype?.match(regex)) {
		throw new BadRequestError(`Пожалуйста предоставьте файлы типа ${type}`)
	}
	if (file?.size > maxSize) {
		throw new BadRequestError(
			`Файл слишком большой, отправляйте до ${
				maxSize / 1024 / 1024
			} MB = ${maxSize} bytes`
		)
	}

	// const translatedName = cyrillicToTranslit
	// 	.transform(file.name, "_")
	// 	.toLowerCase()

	if (type === "image") {
		const { minifiedBuffer, bytesSaved } = await minifyImage(file)
		if (!minifiedBuffer) {
			throw new BadRequestError(`Unable to minify`)
		}
		const image = await uploadBufferToCloud(minifiedBuffer, type)
		console.log({ minifiedBuffer, bytesSaved })
		return { image, bytesSaved }
	}

	if (type === "video") {
		const video = await uploadFileToCloud(file, type)
		return { video, bytesSaved: 0 }
	}
}

function uploadBufferToCloud(buffer, type) {
	return uploadToCloudController(buffer, type)
}
function uploadFileToCloud(file, type) {
	return uploadToCloudController(file.data, type)
}

async function uploadToCloudController(buffer, type) {
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

			streamifier.createReadStream(buffer).pipe(stream)
		})
	} catch (error) {
		console.log(error)
	}
}

module.exports = { uploadFileLocal, uploadToCloud }
