const connect = require("./db/connect");

const container = require("./config/container");

const App = require("./app");

const app = new App(container).setupApp();

app.listen(3000, async () => {
  try {
    await connect.dbConnect();
    console.log("Server is running on port 3000");
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
});
