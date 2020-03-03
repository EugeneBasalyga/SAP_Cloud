sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("admin.cashDispenser.controller.Master", {
        onInit: function () {
            this.root = "http://localhost:3000/";
            let oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "bank");
            this.getView().byId("inputCardNumberId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputCardNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputCardPasswordId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputCardPasswordId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));

            this.oMobileOperator = new JSONModel({
                variants: [
                    {
                        key: 1,
                        name: this.getResourceBundle().getText("a1")
                    },
                    {
                        key: 2,
                        name: this.getResourceBundle().getText("mts")
                    },
                    {
                        key: 3,
                        name: this.getResourceBundle().getText("life")
                    }
                ]
            });
            this.setModel(this.oMobileOperator, "mobileOperator");

            this.oConfigModel  = new JSONModel({
                logInVisible: true,
                cashOperationsVisible: false
            });
            this.setModel(this.oConfigModel, "config");

            this.oCredentials = new JSONModel({
                cardNumber: null,
                cardPassword: null
            });
            this.setModel(this.oCredentials, "credentials");

            this.oLoan = new JSONModel();
            this.setModel(this.oLoan, "loan");
            this.oCustomer = new JSONModel();
            this.setModel(this.oCustomer, "customer");
            this.oCurrency = new JSONModel();
            this.setModel(this.oCurrency, "currency");
            this.oBalance = new JSONModel();
            this.setModel(this.oBalance, "balance");
        },

        submitLogIn: function (oEvent) {
            if (this.areCredentialsFieldsValid()) {
                this.getView().setBusy(true);
                $.ajax({
                    type: "GET",
                    url: this.root + "cashDispenser/logIn",
                    data: this.getModel("credentials").getData(),
                    dataType: "json",
                    success: oData => {
                        this.getView().setBusy(false);
                        if (oData.length !== 0){
                            MessageToast.show(this.getResourceBundle().getText("logInSuccess"));
                            this.getModel("config").setData({
                                logInVisible: false,
                                cashOperationsVisible: true
                            });

                            this.getView().byId("inputWithdrawSumId").setValue("");
                            this.getModel("loan").setData(oData[0][0]);
                            this.getModel("customer").setData(oData[1][0]);
                            this.getModel("currency").setData(oData[2][0]);
                        } else{
                            MessageBox.error(this.getResourceBundle().getText("logInError"), {
                                title: this.getResourceBundle().getText("error")
                            });
                        }
                    },
                    error: oError => {
                        this.getView().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error(oError);
                    }
                });
            }
        },

        submitWithdraw: function (oEvent) {
            if (this.isWithdrawSumValid()) {
                this.getView().setBusy(true);
                $.ajax({
                    type: "GET",
                    url: this.root + "cashDispenser/withdrawMoney",
                    data: {
                        sum: this.getView().byId("inputWithdrawSumId").getValue(),
                        loanId: this.getModel("loan").getProperty("/ID")
                    },
                    dataType: "json",
                    success: oData => {
                        this.getView().setBusy(false);
                        MessageBox.success(this.getResourceBundle().getText("successWithdraw"), {
                            title: this.getResourceBundle().getText("success")
                        });
                    },
                    error: oError => {
                        this.getView().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error(this.getResourceBundle().getText("errorWithdrawSumLack"), {
                            title: this.getResourceBundle().getText("error")
                        });
                    }
                });
            }
        },

        submitPayment: function (oEvent) {
            if (this.arePaymentFieldsValid()){
                this.getView().setBusy(true);
                $.ajax({
                    type: "GET",
                    url: this.root + "cashDispenser/makePayment",
                    data: {
                        sum: this.getView().byId("inputPaymentSumId").getValue(),
                        loanId: this.getModel("loan").getProperty("/ID")
                    },
                    dataType: "json",
                    success: oData => {
                        this.getView().setBusy(false);
                        MessageBox.success(this.getResourceBundle().getText("successPayment"), {
                            title: this.getResourceBundle().getText("success")
                        });
                    },
                    error: oError => {
                        this.getView().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error(this.getResourceBundle().getText("errorWithdrawSumLack"), {
                            title: this.getResourceBundle().getText("error")
                        });
                    }
                });
            }
        },

        arePaymentFieldsValid: function (oEvent) {
            let bValid = true;
            let paymentSum = this.getView().byId("inputPaymentSumId").getValue();
            let phoneNumber = this.getView().byId("inputPhoneNumberId").getValue();
            let mobileOperator = this.getView().byId("selMobileOperatorId").getSelectedItem();

            paymentSum = parseFloat(paymentSum);
            if ((isNaN(paymentSum)) || (paymentSum <= 0)){
                this.getView().byId("inputPaymentSumId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputPaymentSumId").setValueStateText(this.getResourceBundle().getText("errorWithdrawSum"));
                bValid = false;
            }
            else{
                this.getView().byId("inputPaymentSumId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputPaymentSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (phoneNumber === "" || phoneNumber.includes("_")){
                this.getView().byId("inputPhoneNumberId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputPhoneNumberId").setValueStateText(this.getResourceBundle().getText("errorPhoneNumber"));
                bValid = false;
            }
            else{
                this.getView().byId("inputPhoneNumberId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputPhoneNumberId").setValueStateText("obligatoryField");
            }

            if (mobileOperator === null){
                this.getView().byId("selMobileOperatorId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selMobileOperatorId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selMobileOperatorId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selMobileOperatorId").setValueStateText("obligatoryField");
            }

            return bValid;
        },

        isWithdrawSumValid: function (oEvent) {
            let bValid = true;
            let withdrawSum = this.getView().byId("inputWithdrawSumId").getValue();

            withdrawSum = parseFloat(withdrawSum);
            if ((isNaN(withdrawSum)) || (withdrawSum <= 0)){
                this.getView().byId("inputWithdrawSumId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputWithdrawSumId").setValueStateText(this.getResourceBundle().getText("errorWithdrawSum"));
                bValid = false;
            }
            else{
                this.getView().byId("inputWithdrawSumId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputWithdrawSumId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            return bValid;
        },

        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            if (sKey === "pickUpCardKey"){
                this.getModel("credentials").setData({
                    cardNumber: null,
                    cardPassword: null
                });
                MessageToast.show(this.getResourceBundle().getText("logOutSuccess"));
                this.getView().byId("inputCardNumberId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputCardNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                this.getView().byId("inputCardPasswordId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputCardPasswordId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));

                this.getModel("config").setData({
                    logInVisible: true,
                    cashOperationsVisible: false
                });
            }
            else if (sKey === "viewBalanceKey"){
                $.ajax({
                    type: "GET",
                    url: this.root + "cashDispenser/checkBalance",
                    data: {
                        loanId: this.getModel("loan").getProperty("/ID")
                    },
                    dataType: "json",
                    success: oData => {
                        this.getView().setBusy(false);
                        this.getModel("balance").setData({
                            currSum: oData + " " + this.getModel("currency").getProperty("/NAME")
                        });
                    },
                    error: oError => {
                        this.getView().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error(oError);
                    }
                });
                this.byId("pageContainer").to(this.getView().createId(sKey));
            }
            else{
                this.byId("pageContainer").to(this.getView().createId(sKey));
            }

        },

        areCredentialsFieldsValid: function () {
            let bValid = true;
            const oCredentials = this.getModel("credentials").getData();

            if ((oCredentials.cardNumber === null) || (oCredentials.cardNumber.includes("_"))){
                this.getView().byId("inputCardNumberId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputCardNumberId").setValueStateText(this.getResourceBundle().getText("cardNumberError"));
                bValid = false;
            }
            else{
                this.getView().byId("inputCardNumberId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputCardNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if ((oCredentials.cardPassword !== null) && (oCredentials.cardPassword.length === 4) && (!isNaN(oCredentials.cardPassword))){
                this.getView().byId("inputCardPasswordId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputCardPasswordId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }
            else{
                this.getView().byId("inputCardPasswordId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputCardPasswordId").setValueStateText(this.getResourceBundle().getText("cardPasswordError"));
                bValid = false;
            }

            return bValid;
        }
    });
});
