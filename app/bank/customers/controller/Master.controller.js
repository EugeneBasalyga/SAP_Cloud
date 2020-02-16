sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (BaseController, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("admin.bank.controller.Master", {
        onInit: function () {
            let oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "bank");
            this.getRouter().getRoute("master").attachMatched(() =>
                this.byId("idCustomersTable").getBinding("items").refresh());
        },

        onItemPress: function(oEvent){
            const customerId = oEvent.getParameter("listItem").getBindingContext("bank").getProperty("id");
            this.getRouter().navTo("customerDetail", {
                id: customerId
            });
        },

        onCreateCustomer: function(oEvent){
            this.getRouter().navTo("customerDetail", {
                id: "new"
            });
        },

        onDeleteCustomer: function(oEvent){
            const oSelectedEntry = this.getView().byId("idCustomersTable").getSelectedItem();

            if (!oSelectedEntry) {
                MessageToast.show(this.getResourceBundle().getText("selectCustomer"));
                return;
            }

            var oCustomer = oSelectedEntry.getBindingContext("bank").getObject();
            if (oCustomer.loans.length === 0){
                MessageBox.confirm(this.getResourceBundle().getText("questionDelete"), {
                    title: this.getResourceBundle().getText("deleteCustomer"),
                    onClose: this._deleteCustomer.bind(this)
                });
            } else {
                MessageBox.information(this.getResourceBundle().getText("unableToDelete"), {
                    title: this.getResourceBundle().getText("unableToDeleteInfo")
                });
            }

        },

        _deleteCustomer: function (sAnswer) {
            if (sAnswer === MessageBox.Action.OK){
                const oSelectedEntry = this.getView().byId("idCustomersTable").getSelectedItem();
                oSelectedEntry.getBindingContext("bank").delete("$auto").then(
                    result => {
                        MessageToast.show(this.getResourceBundle().getText("successDelete"));
                    },
                    error => {
                        MessageToast.show(error.message)
                    }
                );
            }
        }
    });
});
