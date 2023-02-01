const attachCookies = async ({ res, token }) => {
	const oneDay = 1000 * 60 * 60 * 24
	res.cookie("token", token, {
		expires: new Date(Date.now() + oneDay),
		httpOnly: false,
		secure: true,
		sameSite: "None",
	})
}

const clearCookies = async ({ res }) => {
	res.clearCookie("token")
	// res.cookie("token", "empty", {
	// 	expires: new Date(Date.now()),
	// })
	// both actually work
}

module.exports = { clearCookies, attachCookies }
