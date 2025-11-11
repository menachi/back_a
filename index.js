const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World! 22");
});

app.get("/movie", (req, res) => {
  res.send("get star wars");
});

app.post("/movie", (req, res) => {
  res.send("post star wars");
});

app.delete("/movie", (req, res) => {
  res.send("delete star wars");
});

app.put("/movie", (req, res) => {
  res.send("put star wars");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
