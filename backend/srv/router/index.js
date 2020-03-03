"use strict";

module.exports = (app, server) => {
    app.use("/deposits", require("./routes/deposit")());
    app.use("/loans", require("./routes/loan")());
    app.use("/cashDispenser", require("./routes/cashDispenser")());
};
