const express = require("express")
require("dotenv").config()
const morgan = require("morgan")
const fileUpload = require("express-fileupload")
const cors = require("cors")
// const helmet = require("helmet")
// const xss = require("xss-clean")

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
const { orderRouter } = require("./routers/orderRouter")
const { bookmarkRouter } = require("./routers/bookmarkRouter")
const { statisticsRouter } = require("./routers/statisticsRouter")
const { adsRouter } = require("./routers/adsRouter")
const app = express()

const port = process.env.PORT || 3000

// app.use(xss())
app.use(
	cors({
		credentials: true,
		// origin: ["http://localhost:5173"],
		origin: true,
		methods: ["GET", "POST", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
)

// app.set("trust proxy", 1) // trust first proxy

app.use(express.urlencoded({ extended: true }))
// app.use(helmet())
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(
	fileUpload({
		defCharset: "utf8",
		defParamCharset: "utf8",
	})
)
app.use(express.static("./public"))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", authMiddleware(), userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/reviews", authMiddleware(), reviewRouter)
app.use("/api/v1/orders", authMiddleware(), orderRouter)
app.use("/api/v1/bookmarks", authMiddleware(), bookmarkRouter)
app.use("/api/v1/statistics", authMiddleware(), statisticsRouter)
app.use("/api/v1/ads", adsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const start = async () => {
	try {
		console.log("-------")
		console.log(new Date().toString())
		console.log("-------")
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
