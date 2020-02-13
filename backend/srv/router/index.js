"use strict";

module.exports = (app, server) => {
    app.use("/deposits", require("./routes/deposit")());
};
