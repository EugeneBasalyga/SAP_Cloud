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

    app.get("/logIn", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);
            const sCardNumber = req.query.cardNumber;
            const sCardPassword = req.query.cardPassword;
            let aValues = [ sCardNumber, sCardPassword ];

            let sSql = "SELECT * FROM \"COM_BANK_LOAN\" " +
                "WHERE \"CARDNUMBER\" = ? AND \"PIN\" = ?";

            const oLoan = await db.executeQuery(sSql, aValues);

            if (oLoan.length !== 0){
                sSql = "SELECT * FROM \"COM_BANK_CUSTOMER\" " +
                    "WHERE \"ID\" = ?";

                aValues = [ oLoan[0].CUSTOMER_ID ];
                var oCustomer = await db.executeQuery(sSql, aValues);

                sSql = "SELECT * FROM \"COM_BANK_LOANCURRENCY\" " +
                    "WHERE \"ID\" = ?";

                aValues = [ oLoan[0].CURRENCY_ID ];
                var oCurrency = await db.executeQuery(sSql, aValues);

                res.type("application/json").status(200).send(JSON.stringify([oLoan, oCustomer, oCurrency]));
            } else{
                res.type("application/json").status(200).send(JSON.stringify([]));
            }


        } catch (e) {
            next(e);
        }
    });

    app.get("/withdrawMoney", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);

            const sWithdrawSum = req.query.sum;
            const sLoanId = req.query.loanId;
            var aValues = [ sLoanId ];

            var sSql = "SELECT * FROM \"COM_BANK_LOAN\" " +
                "WHERE \"ID\" = ?";
            const oLoan = await db.executeQuery(sSql, aValues);

            if (parseFloat(sWithdrawSum) > parseFloat(oLoan[0].CURRSUM)){
                res.type("application/json").status(400).send(JSON.stringify([]));
            } else{

                var sum = parseFloat(oLoan[0].CURRSUM) - parseFloat(sWithdrawSum);
                sSql = "UPDATE \"COM_BANK_LOAN\" " +
                    "SET \"CURRSUM\" = ?" +
                    "WHERE \"ID\" = ?";

                aValues = [ sum, sLoanId ];
                await db.executeQuery(sSql, aValues);
                res.type("application/json").status(200).send(JSON.stringify([]));
            }

        } catch (e) {
            next(e);
        }
    });

    app.get("/makePayment", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);

            const sPaymentSum = req.query.sum;
            const sLoanId = req.query.loanId;
            var aValues = [ sLoanId ];

            var sSql = "SELECT * FROM \"COM_BANK_LOAN\" " +
                "WHERE \"ID\" = ?";
            const oLoan = await db.executeQuery(sSql, aValues);

            if (parseFloat(sPaymentSum) > parseFloat(oLoan[0].CURRSUM)){
                res.type("application/json").status(400).send(JSON.stringify([]));
            } else{

                var sum = parseFloat(oLoan[0].CURRSUM) - parseFloat(sPaymentSum);
                sSql = "UPDATE \"COM_BANK_LOAN\" " +
                    "SET \"CURRSUM\" = ?" +
                    "WHERE \"ID\" = ?";

                aValues = [ sum, sLoanId ];
                await db.executeQuery(sSql, aValues);
                res.type("application/json").status(200).send(JSON.stringify([]));
            }

        } catch (e) {
            next(e);
        }
    });

    app.get("/checkBalance", async (req, res, next) => {

        try {
            const db = new dbClass(req.db);
            const sLoanId = req.query.loanId;
            var aValues = [ sLoanId ];

            var sSql = "SELECT \"CURRSUM\" FROM \"COM_BANK_LOAN\" " +
                "WHERE \"ID\" = ?";
            const oCurrSum = await db.executeQuery(sSql, aValues);
            res.type("application/json").status(200).send(JSON.stringify(oCurrSum[0].CURRSUM));

        } catch (e) {
            next(e);
        }
    });

    return app;
};
