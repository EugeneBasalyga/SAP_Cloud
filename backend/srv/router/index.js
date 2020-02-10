"use strict";

module.exports = (app, server) => {
    app.use("/customers", require("./routes/customer")());
};
