const app = require("./src/app");

const server = app.listen(process.env.DEV_APP_PORT || 3000, () => {
  console.log(`Server is running on port: ${process.env.DEV_APP_PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("EXIT SERVER EXPRESS");
  });
});
