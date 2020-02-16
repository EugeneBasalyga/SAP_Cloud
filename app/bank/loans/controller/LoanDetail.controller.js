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
            this._initInputInputFields();
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
                    paymentPerMonth: null,
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
        },

        onCreateBtnPress: function (oEvent) {
            if (this.areInputFieldsValid()){
                const oNewLoan = this.getModel().getData();
                oNewLoan.initialSum = oNewLoan.initialSum.toString();
                const oBinding = this.getOwnerComponent().getModel().bindList("/Loan");
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
                const oContext = oBinding.create(oNewLoan);

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

        onCancelBtnPress: function (oEvent) {
            this.getRouter().navTo("master", true);
        },

        _initInputInputFields: function() {
            this.getView().byId("selLoanCustomerId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selLoanCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selLoanTypeId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selLoanTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selLoanCurrencyId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selLoanCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputLoanContractTermMonthId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputLoanContractTermMonthId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputLoanInitialSumId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputLoanInitialSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selLoanPercentageId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selLoanPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
        },

        areInputFieldsValid: function () {
            let bValid = true;
            const oNewLoan = this.getModel().getData();

            if (oNewLoan.customer_id === null){
                this.getView().byId("selLoanCustomerId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selLoanCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selLoanCustomerId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selLoanCustomerId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewLoan.type_id === null){
                this.getView().byId("selLoanTypeId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selLoanTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selLoanTypeId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selLoanTypeId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewLoan.currency_id === null){
                this.getView().byId("selLoanCurrencyId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selLoanCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selLoanCurrencyId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selLoanCurrencyId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            var contractTermMonth = parseInt(oNewLoan.contractTermMonth);
            if ((isNaN(contractTermMonth)) || (contractTermMonth <= 0)){
                this.getView().byId("inputLoanContractTermMonthId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputLoanContractTermMonthId").setValueStateText(this.getResourceBundle().getText("errorContractTermMonth"));
                bValid = false;
            }
            else{
                this.getView().byId("inputLoanContractTermMonthId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputLoanContractTermMonthId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            var initialSum = parseFloat(oNewLoan.initialSum);
            if ((isNaN(initialSum)) || (initialSum <= 0)){
                this.getView().byId("inputLoanInitialSumId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputLoanInitialSumId").setValueStateText(this.getResourceBundle().getText("errorContractTermMonth"));
                bValid = false;
            }
            else{
                this.getView().byId("inputLoanInitialSumId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputLoanInitialSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (oNewLoan.percentage === null){
                this.getView().byId("selLoanPercentageId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selLoanPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selLoanPercentageId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selLoanPercentageId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }
            return bValid;
        }
    });
});
