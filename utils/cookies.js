const attachCookies = async ({ res, token }) => {
	const oneDay = 1000 * 60 * 60 * 24
	res.cookie("token", token, {
		expires: new Date(Date.now() + oneDay),
		httpOnly: false,
		sameSite: "none",
		// secure: true,
	})
}

const clearCookies = async ({ res }) => {
	res.cookie("token", "empty", {
		expires: new Date(Date.now()),
	})
}

module.exports = { clearCookies, attachCookies }
