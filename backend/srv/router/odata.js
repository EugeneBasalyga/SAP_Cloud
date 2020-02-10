/*eslint no-unused-vars: 0, no-undef:0, no-process-exit:0, new-cap:0*/
/*eslint-env node, es6 */
"use strict";

const dbClass = require(global.__base + "utils/dbClass");
const hdbext = require("@sap/hdbext");

const addWhereClause = (req, aWhere) => {
    req.query.SELECT.where = req.query.SELECT.where ?
        req.query.SELECT.where.concat(["and"]).concat(aWhere) :
        aWhere;

};
const getStudentIdClause = sStId => [{ref: ["stid"]}, ">", {val: sStId}];
const getLangClause = sLang => [{ref: ["lang"]}, "=", {val: sLang}];

module.exports = function () {

    this.before("CREATE", "Customers", async (req) => {
        var client = await dbClass.createConnection();
        let db = new dbClass(client);
        const sSql = "SELECT * FROM \"COM_BANK_CUSTOMER\"";
        const aCustomers = await db.executeQuery(sSql, []);
        aCustomers.sort((firstEl, secondEl) => {
            return firstEl.ID > secondEl.ID;
        });
        let oNewCustomer = req.data;
        oNewCustomer.id = aCustomers[aCustomers.length - 1].ID + 1;
        let bIsDuplicate = aCustomers.some((el) => {
            return (el.NAME === oNewCustomer.name) && (el.SURNAME === oNewCustomer.surname) && (el.MIDDLENAME === oNewCustomer.middleName)
                && (el.PASSPORTSERIES + el.PASSPORTNUMBER === oNewCustomer.passportSeries + oNewCustomer.passportNumber) && (el.IDENTNUMBER === oNewCustomer.identNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Данный пользователь уже существует");
            return;
        }

        bIsDuplicate = aCustomers.some((el) => {
            return (el.PASSPORTSERIES + el.PASSPORTNUMBER === oNewCustomer.passportSeries + oNewCustomer.passportNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Пользователь с данным паспортом уже существует");
            return;
        }

        bIsDuplicate = aCustomers.some((el) => {
            return (el.IDENTNUMBER === oNewCustomer.identNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Пользователь с данным идентификационным номером паспорта уже существует");
            return;
        }
    });


    this.before("UPDATE", "Customers", async (req) => {
        var client = await dbClass.createConnection();
        let db = new dbClass(client);
        const sSql = "SELECT * FROM \"COM_BANK_CUSTOMER\"";
        let aCustomers = await db.executeQuery(sSql, []);
        let oNewCustomer = Object.assign(req.data);
        let oCustomer = aCustomers.find((el) => {
           return el.ID ===  oNewCustomer.id;
        });
        oNewCustomer.name = oNewCustomer.name === undefined ? oCustomer.NAME : oNewCustomer.name;
        oNewCustomer.surname = oNewCustomer.surname === undefined ? oCustomer.SURNAME : oNewCustomer.surname;
        oNewCustomer.middleName = oNewCustomer.middleName === undefined ? oCustomer.MIDDLENAME : oNewCustomer.middleName;
        oNewCustomer.passportSeries = oNewCustomer.passportSeries === undefined ? oCustomer.PASSPORTSERIES : oNewCustomer.passportSeries;
        oNewCustomer.passportNumber = oNewCustomer.passportNumber === undefined ? oCustomer.PASSPORTNUMBER : oNewCustomer.passportNumber;
        oNewCustomer.identNumber = oNewCustomer.identNumber === undefined ? oCustomer.IDENTNUMBER : oNewCustomer.identNumber;
        aCustomers = aCustomers.filter((el) => {
            return el.ID !== oNewCustomer.id;
        });
        let bIsDuplicate = aCustomers.some((el) => {
            return (el.NAME === oCustomer.name) && (el.SURNAME === oNewCustomer.surname) && (el.MIDDLENAME === oNewCustomer.middleName)
                && (el.PASSPORTSERIES + el.PASSPORTNUMBER === oNewCustomer.passportSeries + oNewCustomer.passportNumber) && (el.IDENTNUMBER === oNewCustomer.identNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Данный пользователь уже существует");
            return;
        }

        bIsDuplicate = aCustomers.some((el) => {
            return (el.PASSPORTSERIES + el.PASSPORTNUMBER === oNewCustomer.passportSeries + oNewCustomer.passportNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Пользователь с данным паспортом уже существует");
            return;
        }

        bIsDuplicate = aCustomers.some((el) => {
            return (el.IDENTNUMBER === oNewCustomer.identNumber);
        });
        if (bIsDuplicate){
            req.reject(501, "Пользователь с данным идентификационным номером паспорта уже существует");
            return;
        }
    });

};
