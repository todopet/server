import express from "express";
import path from "path";

const app = express();


app.listen(8080, function () {
  console.log("listening on 8080");
});

module.exports = app;