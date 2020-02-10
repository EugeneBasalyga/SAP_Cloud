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

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('students get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/students", req, res);

        try {
            const db = new dbClass(req.db);
            const sSql = "SELECT * FROM \"STUDENT\"";
            const students = await db.executeQuery(sSql, []);
            tracer.exiting("/students", "Students Get works");
            res.type("application/json").status(201).send(JSON.stringify(students));
        } catch (e) {
            tracer.catching("/students", e);
            next(e);
        }
    });

    app.get("/:stid", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const stid = req.params.stid;

            const sSql = "SELECT * FROM \"STUDENT\" WHERE \"STID\" = ?";
            const aValues = [ stid ];

            console.log(aValues);
            console.log(sSql);
            const oStudent = await db.executeQuery(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oStudent));
        } catch (e) {
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oStudent = _prepareObject(req.body, req);
            oStudent.stid = await db.getNextval("stid");

            const sSql = "INSERT INTO \"STUDENT\" VALUES(?,?,?,?,?,?)";
            const aValues = [ oStudent.stid, oStudent.unid, oStudent.name, oStudent.surname, oStudent.email, oStudent.phoneNumber ];

            console.log(aValues);
            console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oStudent));
        } catch (e) {
            next(e);
        }
    });

    app.delete("/:stid", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const stid = req.params.stid;

            const sSql = "DELETE FROM \"STUDENT\" WHERE \"STID\" = ?";
            const aValues = [ stid ];

            console.log(aValues);
            console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send("Success");
        } catch (e) {
            next(e);
        }
    });

    app.put("/:stid", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const stid = req.params.stid;

            const oStudent = _prepareObject(req.body, req);
            const sSql = "UPDATE \"STUDENT\" " +
                "SET \"UNID\" = ?, \"NAME\" = ?, \"SURNAME\" = ?, \"EMAIL\" = ?, \"PHONENUMBER\" = ?" +
                "WHERE \"STID\" = ?";
            const aValues = [ oStudent.unid, oStudent.name, oStudent.surname, oStudent.email, oStudent.phoneNumber, stid ];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(200).send("Success");
        } catch (e) {
            next(e);
        }
    });

    return app;
};
