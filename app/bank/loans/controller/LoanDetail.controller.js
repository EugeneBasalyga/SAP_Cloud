sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
    "use strict";


    return BaseController.extend("admin.loans.controller.LoanDetail", {
        onInit: function () {
            let oModel = this.getOwnerComponent().getModel();
            this.setModel(oModel, "odata");

            this.BATCH_ID = "LoanUpdateGroupId";
            this.oConfigModel = new JSONModel({
                isCreateMode: false
            });
            this.setModel(this.oConfigModel, "config");

            this.oLoanPercentageModel = new JSONModel({
                variants: [
                    {
                        key: 8,
                        name: this.getResourceBundle().getText("eightPercent")
                    },
                    {
                        key: 9,
                        name: this.getResourceBundle().getText("ninePercent")
                    },
                    {
                        key: 10,
                        name: this.getResourceBundle().getText("tenPercent")
                    },
                    {
                        key: 11,
                        name: this.getResourceBundle().getText("elevenPercent")
                    },
                    {
                        key: 12,
                        name: this.getResourceBundle().getText("twelvePercent")
                    },
                    {
                        key: 13,
                        name: this.getResourceBundle().getText("thirteenPercent")
                    },
                    {
                        key: 14,
                        name: this.getResourceBundle().getText("fourteenPercent")
                    },
                ]
            });
            this.setModel(this.oLoanPercentageModel, "loanPercentageModel");

            this.getRouter().getRoute("loanDetail").attachMatched(this.onLoanDetailRouteMatched, this);
        },

        onLoanDetailRouteMatched: function (oEvent) {
            let id = oEvent.getParameter("arguments").id;
            this.oConfigModel.setProperty("/isCreateMode", false);
            this.getView().unbindObject();

            if (id === "new") {

                this.setModel(new JSONModel({
                    id: 0,
                    contractNumber: null,
                    contractTermMonth: null,
                    initialSum: null,
                    percentage: null,
                    paymentPerMonth: 0,
                    totalSum: null,
                    customer_id: null,
                    type_id: null,
                    currency_id: null
                }));

                this.getView().bindElement("/");

                this.oConfigModel.setProperty("/isCreateMode", true);
            } else {
                this.setModel(this.getOwnerComponent().getModel());
                this.getView().bindElement({
                    path: `/Loan(${id})`,
                    parameters: {
                        $$updateGroupId: this.BATCH_ID
                    },
                    events: {
                        dataRequested: () => this._setBusy(true),
                        dataReceived: () => this._setBusy(false)
                    }
                });

                this.oConfigModel.setProperty("/isCreateMode", false);

            }
        }
    });
});
