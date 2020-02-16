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

            this.oTableButtons = new JSONModel({
                isBtnRepayMonthEnabled: false,
                isBtnRepayLoanEnabled: false
            });
            this.setModel(this.oTableButtons, "tableButtons");

            this.getRouter().getRoute("master").attachMatched(() =>{
                this.byId("idLoansTable").getBinding("items").refresh();
            })
        },

        onItemPress: function(oEvent){
            const loanId = oEvent.getParameter("listItem").getBindingContext("bank").getProperty("id");
            this.getRouter().navTo("loanDetail", {
                id: loanId
            });
        },

        onItemSelected: function(oEvent){
            this.oTableButtons.setProperty("/isBtnRepayMonthEnabled", true);
            this.oTableButtons.setProperty("/isBtnRepayLoanEnabled", true);
        },

        onCreateLoan: function(oEvent){
            this.getRouter().navTo("loanDetail", {
                id: "new"
            });
        },

        onRepayLoan: function(oEvent){
            var oLoan = this.getView().byId("idLoansTable").getSelectedItem().getBindingContext("bank").getObject();
            var totalSum = oLoan.totalSum;
            var paymentPerMonth = oLoan.paymentPerMonth;
            var currency = oLoan.currency.name;
            var sum = (parseFloat(totalSum) * 0.99) + parseFloat(paymentPerMonth);
            MessageBox.confirm(`Вы точно хотите погасить кредит досрочно? Снижение процентной ставки для оставшейся задолженности составит 1%. Общая задолженность: ${sum.toFixed(2)} ${currency}`, {
                title: this.getResourceBundle().getText("repayLoan"),
                onClose: this._repayLoan.bind(this)
            });
        },

        _repayLoan: function (sAnswer) {
            if (sAnswer === MessageBox.Action.OK){
                const oSelectedEntry = this.getView().byId("idLoansTable").getSelectedItem();
                oSelectedEntry.getBindingContext("bank").delete("$auto").then(
                    result => {
                        MessageBox.success(this.getResourceBundle().getText("successRepayLoan"), {
                            title: this.getResourceBundle().getText("success")
                        });
                    },
                    error => {
                        MessageToast.show(error.message)
                    }
                );
            }
        },

        onRepayMonth: function (oEvent) {
            this.getView().setBusy(true);
            const oSelectedEntry = this.getView().byId("idLoansTable").getSelectedItem();
            var oLoan = oSelectedEntry.getBindingContext("bank").getObject();
            $.ajax({
                type: "PUT",
                url: this.root + `loans/${oLoan.id}`,
                dataType: "json",
                success: oData => {
                    this.getView().setBusy(false);
                    MessageBox.success(this.getResourceBundle().getText("monthRepay"), {
                        title: this.getResourceBundle().getText("success")
                    });
                    this.byId("idLoansTable").getBinding("items").refresh();
                },
                error: oError => {
                    this.getView().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error(oError);
                }
            });
        },

        onCloseBankingMonth: function(oEvent){
            this.getView().setBusy(true);
            $.ajax({
                type: "GET",
                url: this.root + "loans/closeBankingMonth",
                dataType: "json",
                success: oData => {
                    this.getView().setBusy(false);
                    MessageBox.success(this.getResourceBundle().getText("closeBankingMonth"), {
                        title: this.getResourceBundle().getText("success")
                    });
                    this.byId("idLoansTable").getBinding("items").refresh();
                },
                error: oError => {
                    this.getView().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error(oError);
                }
            });
        }

    });
});
