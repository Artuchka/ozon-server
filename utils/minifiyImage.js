let imagemin = null
let webpmin = null
let pngquant = null
let jpegtran = null
let optipng = null
let svgo = null
let jpegrecompress = null
;(async () => {
	imagemin = (await import("imagemin")).default

	webpmin = (await import("imagemin-webp")).default
	pngquant = (await import("imagemin-pngquant")).default
	jpegtran = (await import("imagemin-jpegtran")).default
	optipng = (await import("imagemin-optipng")).default
	svgo = (await import("imagemin-svgo")).default
	jpegrecompress = (await import("imagemin-jpeg-recompress")).default
})()

async function minifyImage(image) {
	const imageminOption = { plugins: [] }

	const buffer = image?.data
	const ext = image?.mimetype.split("/")[1]

	if (!buffer || !ext) {
		return null
	}

	if (["jpg", "jpeg"].indexOf(ext) !== -1) {
		imageminOption.plugins.push(jpegtran({ progressive: true }))
	}

	if (ext === "png") {
		imageminOption.plugins.push(optipng({ optimizationLevel: 5 }))
	}

	if (ext === "svg") {
		imageminOption.plugins.push(svgo({ multipass: true }))
	}

	if (ext === "webp") {
		imageminOption.plugins.push(webpmin({ quality: 50 }))
	}

	if (ext === "png") {
		// Lossy compression.
		imageminOption.plugins.push(pngquant())
	}

	if (["jpg", "jpeg"].indexOf(ext) !== -1) {
		imageminOption.plugins.push(jpegrecompress({ quality: "medium" }))
	}

	const minifiedBuffer = await imagemin.buffer(buffer, imageminOption)

	const saved = (
		((buffer.length - minifiedBuffer.length) / buffer.length) *
		100
	).toFixed(2)

	const bytesSaved = buffer.length - minifiedBuffer.length
	console.log(`initial = ${buffer.length}`)
	console.log(`minified =  ${minifiedBuffer.length}`)
	console.log(`saved = ${saved}`)

	return { minifiedBuffer, bytesSaved }
}

module.exports = { minifyImage }
