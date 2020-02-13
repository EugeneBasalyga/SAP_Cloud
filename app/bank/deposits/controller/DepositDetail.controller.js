sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
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
            this._initInputInputFields();
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
            if (this.areInputFieldsValid()){
                const oNewDeposit = this.getModel().getData();
                oNewDeposit.initialSum = oNewDeposit.initialSum.toString();
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
        },

        areInputFieldsValid: function () {
            let bValid = true;
            const oNewDeposit = this.getModel().getData();

            if (oNewDeposit.customer_id === null){
                this.getView().byId("selDepositCustomerId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selDepositCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selDepositCustomerId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selDepositCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewDeposit.type_id === null){
                this.getView().byId("selDepositTypeId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selDepositTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selDepositTypeId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selDepositTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewDeposit.currency_id === null){
                this.getView().byId("selDepositCurrencyId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selDepositCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selDepositCurrencyId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selDepositCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (isNaN(parseFloat(oNewDeposit.initialSum))){
                this.getView().byId("inputDepositInitialSumId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputDepositInitialSumId").setValueStateText(this.getResourceBundle().getText("errorInitialSum"));
                bValid = false;
            }
            else{
                this.getView().byId("inputDepositInitialSumId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputDepositInitialSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewDeposit.percentage === null){
                this.getView().byId("selDepositPercentageId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selDepositPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selDepositPercentageId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selDepositPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }
            return bValid;
        },

        _initInputInputFields: function() {
            this.getView().byId("selDepositCustomerId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selDepositCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selDepositTypeId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selDepositTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selDepositCurrencyId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selDepositCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputDepositInitialSumId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputDepositInitialSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selDepositPercentageId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selDepositPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
        }
    });
});
