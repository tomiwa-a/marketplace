const express = require("express")
const morgan = require("morgan")
require('dotenv').config()

const routes = require("./routes/routes")
const connect = require("./db/connect")
const errorHandlerMiddleware = require("./middleware/error-handler")

const app = express()

app.use(morgan("dev"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(routes.product)
app.use("/location", routes.locations )


app.get("/", (req, res) => {
  res.status(200).json(
    {
        "message": "Welcome to the product API"
    }
  )
})

// Error handling middleware
app.use(errorHandlerMiddleware);

app.listen(3000, async () => {
  await connect.dbConnect()
  console.log("Server is running on port 3000")
})

