const express = require("express")
require("dotenv").config()
const morgan = require("morgan")
const fileUpload = require("express-fileupload")

require("express-async-errors")
const cookieParser = require("cookie-parser")
const { connectDB } = require("./database/connect")
const { userRouter } = require("./routers/userRouter")
const { authRouter } = require("./routers/authRouter")
const { notFoundMiddleware } = require("./middleware/notFound")
const { errorHandlerMiddleware } = require("./middleware/errorHandler")
const { authMiddleware } = require("./middleware/authMiddleware")
const { productRouter } = require("./routers/productRouter")
const { reviewRouter } = require("./routers/reviewRouter")
const app = express()

const port = process.env.PORT || 3000

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use(express.urlencoded({ extended: false }))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", authMiddleware, userRouter)
app.use("/api/v1/products", authMiddleware, productRouter)
app.use("/api/v1/reviews", authMiddleware, reviewRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URL)
		console.log("connected to DB")
		app.listen(port, () => {
			console.log(`app is listening on port=${port}`)
		})
	} catch (error) {
		console.log(error)
	}
}

start()
