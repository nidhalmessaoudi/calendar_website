const path = require("path");
const express = require("express");
const bp = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

const controller = require("./controller.js");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");

const app = express();

app.use(express.static(publicDir));
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

// DB Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.post("/api/projects", async (req, res) => {
  try {
    const body = req.body;
    await controller.addProject(connection, body);
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occured while creating a new project",
    });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const data = await controller.getProjects(connection);
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occured while retrieving the projects",
    });
  }
});

app.delete("/api/projects/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    await controller.deleteProject(connection, pid);
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occured while deleting the project",
    });
  }
});

app.patch("/api/projects/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const body = req.body;
    await controller.updateProject(connection, pid, body);
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occured while updating the project",
    });
  }
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);

  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
});
