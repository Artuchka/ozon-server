const SibApiV3Sdk = require("sib-api-v3-sdk")
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
	process.env.SENDIINBLUE_API_KEY

const sendEmail = ({ emailTo }) => {
	console.log(`sending to ${emailTo}`)
	new SibApiV3Sdk.TransactionalEmailsApi()
		.sendTransacEmail({
			sender: { email: "yandex949@gmail.com", name: "0Z0N fake" },
			subject: "Пожалуйста, подтвердите вход в 0Z0N-fake",
			htmlContent: `<!DOCTYPE html><html><body><h1>My First Heading</h1><a href='http://localhost:5173/emailVerified?token=${123}'>click me</a></body></html>`,
			params: {
				greeting: "Hello from 0Z0N-fake!",
				headline: "Follow the link in message",
			},
			messageVersions: [
				{
					to: [
						{
							email: emailTo,
							name: "Johny Smith",
						},
					],
				},
			],
		})
		.then(
			function (data) {
				console.log(data)
				console.log({ data })
			},
			function (error) {
				console.error(error)
			}
		)
}

module.exports = { sendEmail }
