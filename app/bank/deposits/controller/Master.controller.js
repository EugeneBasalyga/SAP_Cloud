sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("admin.deposits.controller.Master", {
        onInit: function () {
            this.root = "http://localhost:3000/";
            let oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "bank");

            this.oTableButtons = new JSONModel({
                isCloseBtnEnabled: false,
                isWithdrawBtnEnabled: false
            });
            this.setModel(this.oTableButtons, "tableButtons");
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
        },

        onCloseBankingMonth: function(oEvent){
            this.getView().setBusy(true);
            $.ajax({
                type: "GET",
                url: this.root + "deposits/closeBankingMonth",
                dataType: "json",
                success: oData => {
                    this.getView().setBusy(false);
                    this.byId("idDepositsTable").getBinding("items").refresh();
                    MessageBox.success(this.getResourceBundle().getText("closeBankingMonth"), {
                        title: this.getResourceBundle().getText("success")
                    });
                },
                error: oError => {
                    this.getView().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error(oError);
                }
            });
        },

        onWithdrawPercents: function(oEvent){
            this.getView().setBusy(true);
            const oSelectedEntry = this.getView().byId("idDepositsTable").getSelectedItem();
            var oDeposit = oSelectedEntry.getBindingContext("bank").getObject();
            $.ajax({
                type: "PUT",
                url: this.root + `deposits/${oDeposit.id}`,
                dataType: "json",
                success: oData => {
                    this.getView().setBusy(false);
                    this.byId("idDepositsTable").getBinding("items").refresh();
                    MessageBox.success(`Проценты в размере ${oData.withdraw} ${oData.currency} успешно сняты и переведены на основной счёт клиента.`, {
                        title: this.getResourceBundle().getText("success")
                    });
                },
                error: oError => {
                    this.getView().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error(oError);
                }
            });
        },

        onItemSelected: function(oEvent){
            var oItem = oEvent.getSource().getSelectedItem();
            var depositTypeId = oItem.getBindingContext("bank").getObject().type.id;
            if (depositTypeId === 1){
                this.oTableButtons.setProperty("/isCloseBtnEnabled", false);
                this.oTableButtons.setProperty("/isWithdrawBtnEnabled", true);
            }
            else if (depositTypeId === 2){
                this.oTableButtons.setProperty("/isCloseBtnEnabled", true);
                this.oTableButtons.setProperty("/isWithdrawBtnEnabled", false);
            }
        },

        onCloseDeposit: function(oEvent){
            MessageBox.confirm(this.getResourceBundle().getText("questionCloseDeposit"), {
                title: this.getResourceBundle().getText("closeDeposit"),
                onClose: this._closeDeposit.bind(this)
            });
        },

        _closeDeposit: function (sAnswer) {
            if (sAnswer === MessageBox.Action.OK){
                const oSelectedEntry = this.getView().byId("idDepositsTable").getSelectedItem();
                var oDeposit = oSelectedEntry.getBindingContext("bank").getObject();
                var curBalance = oDeposit.curBalance;
                var currency = oDeposit.currency.name;
                oSelectedEntry.getBindingContext("bank").delete("$auto").then(
                    result => {
                        MessageBox.success(`Депозитный договор успешно закрыт. Накопленные денежные средства в размере ${curBalance} ${currency} успешно переведены на основной счёт клиента.`, {
                            title: this.getResourceBundle().getText("success")
                        });
                    },
                    error => {
                        MessageToast.show(error.message)
                    }
                );
            }
        }
    });
});
