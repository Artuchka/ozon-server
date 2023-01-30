const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const SibApiV3Sdk = require("sib-api-v3-sdk")
const { generateVerificationEmail } = require("./mailGenerator")
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
	process.env.SENDIINBLUE_API_KEY

const frontURL = process.env.FRONT_URL

const sendEmail = ({ emailTo, token }) => {
	console.log(`sending to ${emailTo} with token=${token}`)
	// sendGridEmail({ emailTo, token })
	sendInBlueEmail({ emailTo, token })
}

module.exports = { sendEmail }

function sendInBlueEmail({ emailTo, token }) {
	new SibApiV3Sdk.TransactionalEmailsApi()
		.sendTransacEmail({
			sender: { email: "yandex949@gmail.com", name: "Артём Горбунов" },
			subject: "Пожалуйста, подтвердите вход в OZON-fake",
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
							name: "Пользватель ozon-fake",
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

function sendGridEmail({ emailTo, token }) {
	const msg = {
		to: emailTo, // Change to your recipient
		from: "i405b06@voenmeh.ru", // Change to your verified sender
		subject: "Пожалуйста, подтвердите вход в OZON-fake",
		text: "only html",
		html: generateVerificationEmail({ frontURL, token }),
	}
	sgMail
		.send(msg)
		.then(() => {
			console.log("Email sent")
		})
		.catch((error) => {
			console.error(error)
			console.log(error.response.body.errors)
		})
}

const nodemailer = require("nodemailer")

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: "smtp-relay.sendinblue.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: "yandex949@gmail.com",
		pass: process.env.SENDIINBLUE_SMTP_KEY,
	},
})

// { emailTo, token }
async function sendinBlueSMTP() {
	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <yandex949@gmail.com>', // sender address
		to: "artuchkaa@gmail.com", // list of receivers
		subject: "Hello ✔", // Subject line
		text: "Hello world?", // plain text body
		html: "<b>Hello world?</b>", // html body
	})

	console.log("Message sent: %s", info.messageId)
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...}
}
// sendinBlueSMTP().catch(console.error)
