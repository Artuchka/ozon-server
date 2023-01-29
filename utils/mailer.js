const SibApiV3Sdk = require("sib-api-v3-sdk")
const { generateVerificationEmail } = require("./mailGenerator")
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
	process.env.SENDIINBLUE_API_KEY

const frontURL = process.env.FRONT_URL

const sendEmail = ({ emailTo, token }) => {
	console.log(`sending to ${emailTo} with token=${token}`)

	new SibApiV3Sdk.TransactionalEmailsApi()
		.sendTransacEmail({
			sender: { email: "yandex949@gmail.com", name: "0Z0N fake" },
			subject: "Пожалуйста, подтвердите вход в 0Z0N-fake",
			htmlContent: generateVerificationEmail({ frontURL, token }),
			params: {
				greeting: "Hello from 0Z0N-fake!",
				headline: "Follow the link in message",
			},
			messageVersions: [
				{
					to: [
						{
							email: emailTo,
							name: "Новый пользватель ozon-fake",
						},
					],
				},
			],
		})
		.then(
			function (data) {
				console.log({ data })
			},
			function (error) {
				console.error({ error })
			}
		)
}

module.exports = { sendEmail }
