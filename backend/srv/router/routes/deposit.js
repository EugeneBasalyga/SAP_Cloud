/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");
const dbClass = require(global.__base + "utils/dbClass");


function _prepareObject(oUser, req) {
    oUser.changedBy = "DebugUser";
    return oUser;
}


module.exports = () => {
    const app = express.Router();

    app.get("/closeBankingMonth", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);
            let sSql = "UPDATE \"COM_BANK_DEPOSIT\" " +
            "SET \"CURBALANCE\" = \"CURBALANCE\" + \"PERCENTAGE\" / 100 * \"INITIALSUM\" " +
            "WHERE \"TYPE_ID\" = 1";
            await db.executeQuery(sSql, []);
            sSql = "UPDATE \"COM_BANK_DEPOSIT\" " +
                "SET \"CURBALANCE\" = \"CURBALANCE\" + \"PERCENTAGE\" / 100 * \"CURBALANCE\" " +
                "WHERE \"TYPE_ID\" = 2";
            const aDeposits = await db.executeQuery(sSql, []);
            res.type("application/json").status(200).send(JSON.stringify(aDeposits));
        } catch (e) {
            tracer.catching("/deposits", e);
            next(e);
        }
    });

    app.put("/:depid", async (req, res, next) => {
        try {
            let db = new dbClass(req.db);
            const depId = req.params.depid;
            let aValues = [ depId ];

            let sSql = "SELECT * FROM \"COM_BANK_DEPOSIT\" " +
                "WHERE \"ID\" = ?";

            const oDeposit = await db.executeQuery(sSql, aValues);

            aValues = [ oDeposit[0].CURRENCY_ID ];
            sSql = "SELECT * FROM \"COM_BANK_DEPOSITCURRENCY\" " +
                "WHERE \"ID\" = ?";

            const oDepositType = await db.executeQuery(sSql, aValues);

            const oData = {
                withdraw: oDeposit[0].CURBALANCE - oDeposit[0].INITIALSUM,
                currency: oDepositType[0].NAME
            };

            aValues = [ depId ];
            sSql = "UPDATE \"COM_BANK_DEPOSIT\" " +
                "SET \"CURBALANCE\" = \"INITIALSUM\" " +
                "WHERE \"ID\" = ?";

            await db.executeQuery(sSql, aValues);

            res.type("application/json").status(200).send(JSON.stringify(oData));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
