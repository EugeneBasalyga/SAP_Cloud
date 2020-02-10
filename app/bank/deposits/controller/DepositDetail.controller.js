sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, MessageToast, MessageBox, History) {
    "use strict";


    return BaseController.extend("admin.deposits.controller.DepositDetail", {
        onInit: function () {
            let oModel = this.getOwnerComponent().getModel();
            this.setModel(oModel, "odata");

            this.BATCH_ID = "DepositUpdateGroupId";
            this.oConfigModel = new JSONModel({
                isCreateMode: false
            });
            this.setModel(this.oConfigModel, "config");

            this.oDepositPercentageModel = new JSONModel({
                variants: [
                    {
                        key: 1,
                        name: this.getResourceBundle().getText("onePercent")
                    },
                    {
                        key: 2,
                        name: this.getResourceBundle().getText("twoPercent")
                    },
                    {
                        key: 3,
                        name: this.getResourceBundle().getText("threePercent")
                    },
                    {
                        key: 4,
                        name: this.getResourceBundle().getText("fourPercent")
                    },
                    {
                        key: 5,
                        name: this.getResourceBundle().getText("fivePercent")
                    }
                ]
            });
            this.setModel(this.oDepositPercentageModel, "depositPercentageModel");

            this.getRouter().getRoute("depositDetail").attachMatched(this.onDepositDetailRouteMatched, this);
        },

        onDepositDetailRouteMatched: function (oEvent) {
            let id = oEvent.getParameter("arguments").id;
            this.oConfigModel.setProperty("/isCreateMode", false);
            this.getView().unbindObject();

            if (id === "new") {

                this.setModel(new JSONModel({
                    id: 0,
                    contract_number: null,
                    startDate: null,
                    endDate: null,
                    initialSum: null,
                    curBalance: null,
                    percentage: null,
                    customer_id: null,
                    type_id: null,
                    currency_id: null
                }));

                this.getView().bindElement("/");

                this.oConfigModel.setProperty("/isCreateMode", true);
            } else {
                this.setModel(this.getOwnerComponent().getModel());
                this.getView().bindElement({
                    path: `/Deposit(${id})`,
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
        },

        onCancelBtnPress: function (oEvent) {
            this.getRouter().navTo("master", true);
        },

        onCreateBtnPress: function (oEvent) {
            const oNewDeposit = this.getModel().getData();
            const oBinding = this.getOwnerComponent().getModel().bindList("/Deposit");
            this._setBusy(true);
            oBinding.attachCreateCompleted(function (oEvent) {
                let oContext = oEvent.getParameter("context");
                let bSuccess = oEvent.getParameter("success");
                if (!bSuccess) {
                    let messages = oContext.getModel().getMessagesByPath("");
                    let message = messages[messages.length - 1].message;
                    MessageBox.error(message, {
                        title: this.getResourceBundle().getText("error")
                    });
                    this._setBusy(false);
                }
            }.bind(this));
            const oContext = oBinding.create(oNewDeposit);

            //TODO catch doesn't work
            oContext.created()
                .then(() => {
                    this._setBusy(false);
                    MessageToast.show(this.getResourceBundle().getText("successCreate"));
                    this.getRouter().navTo("master", true);
                })
                .catch((oError) => {
                    this._setBusy(false);
                    //TODO
                });
        }
    });
});
