sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (BaseController, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("admin.deposits.controller.Master", {
        onInit: function () {
            let oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "bank");

            this.getRouter().getRoute("master").attachMatched(() =>
                this.byId("idDepositsTable").getBinding("items").refresh());
        },

        onItemPress: function(oEvent){
            const depositId = oEvent.getParameter("listItem").getBindingContext("bank").getProperty("id");
            this.getRouter().navTo("depositDetail", {
                id: depositId
            });
        },

        onCreateDeposit: function(oEvent){
            this.getRouter().navTo("depositDetail", {
                id: "new"
            });
        }
        //
        // onDeleteCustomer: function(oEvent){
        //     const oSelectedEntry = this.getView().byId("idCustomersTable").getSelectedItem();
        //     if (!oSelectedEntry) {
        //         MessageToast.show(this.getResourceBundle().getText("selectCustomer"));
        //         return;
        //     }
        //
        //     MessageBox.confirm(this.getResourceBundle().getText("questionDelete"), {
        //         title: this.getResourceBundle().getText("deleteCustomer"),
        //         onClose: this._deleteCustomer.bind(this)
        //     });
        // },
        //
        // _deleteCustomer: function (sAnswer) {
        //     if (sAnswer === MessageBox.Action.OK){
        //         const oSelectedEntry = this.getView().byId("idCustomersTable").getSelectedItem();
        //         oSelectedEntry.getBindingContext("bank").delete("$auto").then(
        //             result => {
        //                 MessageToast.show(this.getResourceBundle().getText("successDelete"));
        //             },
        //             error => {
        //                 MessageToast.show(error.message)
        //             }
        //         );
        //     }
        // }
    });
});
