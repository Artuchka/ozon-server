const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			default: "username",
		},
		firstName: {
			type: String,
			required: true,
			default: "temka",
		},
		lastName: {
			type: String,
			required: true,
			default: "artuchka",
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: validator.isEmail,
			},
		},
		password: {
			type: String,
			required: true,
			default: "placeholder",
		},
		verifyToken: {
			type: String,
			required: true,
			default: "placeholder",
		},
		isVerifiedEmail: {
			type: Boolean,
			required: true,
			default: false,
		},
		phone: {
			type: String,
			default: "+79217850937",
			required: true,
			validate: {
				validator: (v) => validator.isMobilePhone(v, "ru-RU"),
			},
		},
		gender: {
			type: String,
			required: true,
			default: "male",
			enum: ["male", "female", "Attack Helicopter"],
		},
		role: {
			type: String,
			required: true,
			default: "user",
			enum: ["user", "admin", "vendor"],
		},
		birthday: {
			type: Date,
			default: new Date(Date.now()),
		},
		avatar: {
			type: String,
			required: true,
			default:
				"https://res.cloudinary.com/dzy8xh83i/image/upload/v1675242725/OZON_DEFAULT/defaultAvatar_m1pcjd.png",
		},
		location: {
			type: String,
			required: true,
			default: "Los Angelos",
		},
	},
	{
		timestamps: true,
	}
)

UserSchema.pre("save", async function () {
	if (this.isModified("password")) {
		console.log("updating password")
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(this.password, salt)
		this.password = hashedPassword
	}
})

UserSchema.methods.comparePassword = async function (candidate) {
	return bcrypt.compare(candidate, this.password)
}

const Users = new mongoose.model("User", UserSchema)

module.exports = { Users }
