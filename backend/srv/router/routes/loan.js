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

    app.put("/:loanId", async (req, res, next) => {
        try {
            let db = new dbClass(req.db);
            const loanId = req.params.loanId;
            let aValues = [ loanId ];

            let sSql = "UPDATE \"COM_BANK_LOAN\" " +
                "SET \"PAYMENTPERMONTH\" = 0 " +
                "WHERE \"ID\" = ?";

            let oLoan = await db.executeQuery(sSql, aValues);
            res.type("application/json").status(200).send(JSON.stringify(oLoan));
        } catch (e) {
            next(e);
        }
    });

    app.get("/closeBankingMonth", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);
            let sSql = "SELECT * FROM \"COM_BANK_LOAN\" " +
                "WHERE \"TYPE_ID\" = 1";
            let annuityPayments = await db.executeQuery(sSql, []);
            annuityPayments.forEach(el =>{
                let percentageRateMonth = el.PERCENTAGE / 12 / 100;
                let annuityFactor = (percentageRateMonth * Math.pow(percentageRateMonth + 1, el.CONTRACTTERMMONTH)) / (Math.pow(percentageRateMonth + 1, el.CONTRACTTERMMONTH) - 1);
                el.TOTALSUM = parseFloat(el.TOTALSUM) - annuityFactor * parseFloat(el.INITIALSUM);
                if (el.TOTALSUM <= 0){
                    el.PAYMENTPERMONTH = parseFloat(el.PAYMENTPERMONTH) + annuityFactor * parseFloat(el.INITIALSUM) + parseFloat(el.TOTALSUM);
                    el.TOTALSUM = 0;
                } else {
                    el.PAYMENTPERMONTH = parseFloat(el.PAYMENTPERMONTH) + annuityFactor * parseFloat(el.INITIALSUM);
                }
            });


            sSql = "DELETE FROM \"COM_BANK_LOAN\" " +
                "WHERE \"TYPE_ID\" = 1";
            await db.executeQuery(sSql, []);

            for (const el of annuityPayments) {
                sSql = "INSERT INTO \"COM_BANK_LOAN\" VALUES(?,?,?,?,?,?,?,?,?,?)";
                const aValues = [ el.ID, el.CONTRACTNUMBER, el.CONTRACTTERMMONTH, el.INITIALSUM, el.PERCENTAGE, el.PAYMENTPERMONTH.toString(), el.TOTALSUM.toString(), el.CUSTOMER_ID, el.TYPE_ID, el.CURRENCY_ID  ];
                await db.executeQuery(sSql, aValues);
            }

            sSql = "SELECT * FROM \"COM_BANK_LOAN\" " +
                "WHERE \"TYPE_ID\" = 2";
            let differentialPayments = await db.executeQuery(sSql, []);
            differentialPayments.forEach(el =>{
                var creditBody = parseFloat(el.INITIALSUM) / el.CONTRACTTERMMONTH;
                el.TOTALSUM = parseFloat(el.TOTALSUM) - parseFloat(el.INITIALSUM) * parseFloat(el.PERCENTAGE) / 100 / 365 * 30 - creditBody;
                if (el.TOTALSUM <= 0){
                    el.PAYMENTPERMONTH = parseFloat(el.PAYMENTPERMONTH) + parseFloat(el.INITIALSUM) * parseFloat(el.PERCENTAGE) / 100 / 365 * 30 + creditBody + parseFloat(el.TOTALSUM);
                    el.TOTALSUM = 0;
                } else {
                    el.PAYMENTPERMONTH = parseFloat(el.PAYMENTPERMONTH) + parseFloat(el.INITIALSUM) * parseFloat(el.PERCENTAGE) / 100 / 365 * 30 + creditBody;
                }
            });

            sSql = "DELETE FROM \"COM_BANK_LOAN\" " +
                "WHERE \"TYPE_ID\" = 2";
            await db.executeQuery(sSql, []);

            for (const el of differentialPayments) {
                sSql = "INSERT INTO \"COM_BANK_LOAN\" VALUES(?,?,?,?,?,?,?,?,?,?)";
                const aValues = [ el.ID, el.CONTRACTNUMBER, el.CONTRACTTERMMONTH, el.INITIALSUM, el.PERCENTAGE, el.PAYMENTPERMONTH.toString(), el.TOTALSUM.toString(), el.CUSTOMER_ID, el.TYPE_ID, el.CURRENCY_ID  ];
                await db.executeQuery(sSql, aValues);
            }

            res.type("application/json").status(200).send(JSON.stringify({}));
        } catch (e) {
            tracer.catching("/deposits", e);
            next(e);
        }
    });

    return app;
};
