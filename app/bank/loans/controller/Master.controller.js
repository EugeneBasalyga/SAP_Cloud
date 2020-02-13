sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("admin.loans.controller.Master", {
        onInit: function () {
            this.root = "http://localhost:3000/";
            let oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "bank");

        },

        onItemPress: function(oEvent){
            const loanId = oEvent.getParameter("listItem").getBindingContext("bank").getProperty("id");
            this.getRouter().navTo("loanDetail", {
                id: loanId
            });
        },

        onCreateLoan: function(oEvent){
            this.getRouter().navTo("loanDetail", {
                id: "new"
            });
        }
    });
});
