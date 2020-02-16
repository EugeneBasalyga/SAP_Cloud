sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, MessageToast, MessageBox, History) {
    "use strict";


    return BaseController.extend("admin.bank.controller.CustomerDetail", {
        onInit: function () {
            let oModel = this.getOwnerComponent().getModel();
            this.setModel(oModel, "odata");

            this.BATCH_ID = "CustomersUpdateGroupId";
            this.oConfigModel = new JSONModel({
                isEditMode: false,
                isCreateMode: false
            });
            this.setModel(this.oConfigModel, "config");
            this.oSexModel = new JSONModel({
                variants: [
                    {
                        key: this.getResourceBundle().getText("sexManShort"),
                        name: this.getResourceBundle().getText("sexMan")
                    },
                    {
                        key: this.getResourceBundle().getText("sexWomanShort"),
                        name: this.getResourceBundle().getText("sexWoman")
                    }
                ]
            });
            this.isValidBirthDate = null;
            this.isValidIssuedWhenDate = null;
            this.setModel(this.oSexModel, "sexModel");
            this.getRouter().getRoute("customerDetail").attachMatched(this.onCustomerDetailRouteMatched, this);
        },

        onCustomerDetailRouteMatched: function (oEvent) {
            this._initInputInputFields();
            let id = oEvent.getParameter("arguments").id;
            this.oConfigModel.setProperty("/isCreateMode", false);
            this._setEditMode(false);
            this.getView().unbindObject();

            if (id === "new") {

                this.isValidBirthDate = false;
                this.isValidIssuedWhenDate = false;
                this.setModel(new JSONModel({
                    id: 0,
                    sex: null,
                    name: null,
                    surname: null,
                    middleName: null,
                    birthDate: null,
                    birthPlace: null,
                    actResCity_id: null,
                    actResAddress: null,
                    phoneNumber: null,
                    regCity_id: null,
                    maritalStatus_id: null,
                    citizenship_id: null,
                    disability_id: null,
                    isPensioner: null,
                    passportSeries: null,
                    passportNumber: null,
                    issuedWhen: null,
                    identNumber: null,
                    workPlace: null,
                    workPosition: null,
                }));

                this.getView().bindElement("/");

                this._setEditMode(true);
                this.oConfigModel.setProperty("/isCreateMode", true);

            } else {
                this.isValidBirthDate = true;
                this.isValidIssuedWhenDate = true;
                this.setModel(this.getOwnerComponent().getModel());
                this.getView().bindElement({
                    path: `/Customers(${id})`,
                    parameters: {
                        $$updateGroupId: this.BATCH_ID,
                        $expand: "loans"
                    },
                    events: {
                        dataRequested: () => this._setBusy(true),
                        dataReceived: () => this._setBusy(false)
                    }
                });

                this._setEditMode(false);

            }
        },

        onSaveBtnPress: function () {
            if (this.oConfigModel.getProperty("/isCreateMode")) {
                this._createCustomer();
            } else {
                this._updateCustomer();
            }
        },

        onEditPress: function (oEvent) {
            this._setEditMode(true);
        },

        onDeletePress: function (oEvent) {
            var oCustomer = this.getView().getBindingContext().getObject();
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
                let oContext = this.getView().getBindingContext();
                oContext.delete("$auto").then(
                    result => {
                        MessageToast.show(this.getResourceBundle().getText("successDelete"));
                        this.getRouter().navTo("master", true);
                    },
                    error => {
                        MessageToast.show(error.message)
                    }
                );
            }
        },

        onCancelBtnPress: function (oEvent) {
            this.getOwnerComponent().getModel().resetChanges(this.BATCH_ID);
            if (this.oConfigModel.getProperty("/isCreateMode")) {
                this.getRouter().navTo("master", true);
            } else {
                this._initInputInputFields();
                this._setEditMode(false);
            }
        },

        _createCustomer: function () {
            if (this.areInputFieldsValid()){
                const oNewCustomer = this.getModel().getData();
                const oBinding = this.getOwnerComponent().getModel().bindList("/Customers");
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
                const oContext = oBinding.create(oNewCustomer);

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

        _navBack: function () {
            const oHistory = History.getInstance();

            if (oHistory.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("master", true);
            }
        },
        _setEditMode: function (isEdit) {
            this.oConfigModel.setProperty("/isEditMode", isEdit);
        },

        _updateCustomer: function () {
            if (this.areInputFieldsValid()){

                if (!this.getModel().hasPendingChanges()) {
                    MessageToast.show(this.getResourceBundle().getText("changeFieldsToSave"));
                    return;
                }
                this._setBusy(true);

                this.getModel().submitBatch(this.BATCH_ID).then(() => {
                    //Костылище attachPatchCompleted ???
                    var messages = this.getModel().getMessagesByPath("");
                    if (messages == null || messages.length === 0){
                        this._setBusy(false);
                        this._setEditMode(false);
                        MessageToast.show(this.getResourceBundle().getText("successEdit"));
                    }
                    else {
                        let message = messages[messages.length - 1].message;
                        this.getModel().resetChanges(this.BATCH_ID);
                        MessageBox.error(message, {
                            title: this.getResourceBundle().getText("error")
                        });
                        this.getModel().setMessages([]);
                        this._setBusy(false);
                    }

                })
                .catch(() => {
                    //TODO
                    this._setBusy(false);
                });
            }

        },

        getInputValuesMap: function () {
            let aInputValuesMap = new Map();
            aInputValuesMap.set("inputSurname", this.getView().byId("inputSurnameId").getValue());
            aInputValuesMap.set("inputName", this.getView().byId("inputNameId").getValue());
            aInputValuesMap.set("inputMiddleName", this.getView().byId("inputMiddleNameId").getValue());
            aInputValuesMap.set("dpBirthDate", this.getView().byId("dpBirthDateId").getValue());
            aInputValuesMap.set("selSex", this.getView().byId("selSexId").getSelectedKey());
            aInputValuesMap.set("inputBirthPlace", this.getView().byId("inputBirthPlaceId").getValue());
            aInputValuesMap.set("selActResidenceCity", this.getView().byId("selActResidenceCityId").getSelectedKey());
            aInputValuesMap.set("inputActResAddress", this.getView().byId("inputActResAddressId").getValue());
            aInputValuesMap.set("selRegCity", this.getView().byId("selRegCityId").getSelectedKey());
            aInputValuesMap.set("selMaritalStatus", this.getView().byId("selMaritalStatusId").getSelectedKey());
            aInputValuesMap.set("selCitizenship", this.getView().byId("selCitizenshipId").getSelectedKey());
            aInputValuesMap.set("selDisability", this.getView().byId("selDisabilityId").getSelectedKey());
            aInputValuesMap.set("cbIsPensioner", this.getView().byId("cbIsPensionerId").getSelected());
            aInputValuesMap.set("inputPassportSeries", this.getView().byId("inputPassportSeriesId").getValue());
            aInputValuesMap.set("inputPassportNumber", this.getView().byId("inputPassportNumberId").getValue());
            aInputValuesMap.set("inputIssuedBy", this.getView().byId("inputIssuedById").getValue());
            aInputValuesMap.set("dpIssuedWhen", this.getView().byId("dpIssuedWhenId").getValue());
            aInputValuesMap.set("inputIdentNumber", this.getView().byId("inputIdentNumberId").getValue());
            aInputValuesMap.set("inputPhoneNumber", this.getView().byId("inputPhoneNumberId").getValue());
            aInputValuesMap.set("inputWorkPlace", this.getView().byId("inputWorkPlaceId").getValue());
            aInputValuesMap.set("inputWorkPosition", this.getView().byId("inputWorkPositionId").getValue());
            return aInputValuesMap;
        },

        areInputFieldsValid: function () {
            let bValid = true;
            let aInputValuesMap = this.getInputValuesMap();
            if (!(/^[A-Za-zА-Яа-я]+$/.test(aInputValuesMap.get("inputSurname")))){
                this.getView().byId("inputSurnameId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputSurnameId").setValueStateText(this.getResourceBundle().getText("errorSurname"));
                bValid = false;
            }
            else{
                this.getView().byId("inputSurnameId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputSurnameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!(/^[A-Za-zА-Яа-я]+$/.test(aInputValuesMap.get("inputName")))){
                this.getView().byId("inputNameId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputNameId").setValueStateText(this.getResourceBundle().getText("errorName"));
                bValid = false;
            }
            else{
                this.getView().byId("inputNameId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputNameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!(/^[A-Za-zА-Яа-я]+$/.test(aInputValuesMap.get("inputMiddleName")))){
                this.getView().byId("inputMiddleNameId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputMiddleNameId").setValueStateText(this.getResourceBundle().getText("errorMiddleName"));
                bValid = false;
            }
            else{
                this.getView().byId("inputMiddleNameId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputMiddleNameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!this.isValidBirthDate){
                this.getView().byId("dpBirthDateId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dpBirthDateId").setValueStateText(this.getResourceBundle().getText("errorBirthDate"));
                bValid = false;
            }
            else{
                this.getView().byId("dpBirthDateId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("dpBirthDateId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selSex") === ""){
                this.getView().byId("selSexId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selSexId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selSexId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selSexId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("inputBirthPlace") === ""){
                this.getView().byId("inputBirthPlaceId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputBirthPlaceId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("inputBirthPlaceId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputBirthPlaceId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selActResidenceCity") === ""){
                this.getView().byId("selActResidenceCityId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selActResidenceCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selActResidenceCityId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selActResidenceCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("inputActResAddress") === ""){
                this.getView().byId("inputActResAddressId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputActResAddressId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("inputActResAddressId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputActResAddressId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selRegCity") === ""){
                this.getView().byId("selRegCityId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selRegCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selRegCityId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selRegCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selMaritalStatus") === ""){
                this.getView().byId("selMaritalStatusId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selMaritalStatusId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selMaritalStatusId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selMaritalStatusId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selCitizenship") === ""){
                this.getView().byId("selCitizenshipId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selCitizenshipId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selCitizenshipId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selCitizenshipId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("selDisability") === ""){
                this.getView().byId("selDisabilityId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("selDisabilityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("selDisabilityId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("selDisabilityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!(/^[A-Z]{2}$/.test(aInputValuesMap.get("inputPassportSeries")))){
                this.getView().byId("inputPassportSeriesId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputPassportSeriesId").setValueStateText(this.getResourceBundle().getText("errorPassportSeries"));
                bValid = false;
            }
            else{
                this.getView().byId("inputPassportSeriesId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputPassportSeriesId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!(/^[0-9]{7}$/.test(aInputValuesMap.get("inputPassportNumber")))){
                this.getView().byId("inputPassportNumberId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputPassportNumberId").setValueStateText(this.getResourceBundle().getText("errorPassportNumber"));
                bValid = false;
            }
            else{
                this.getView().byId("inputPassportNumberId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputPassportNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("inputIssuedBy") === ""){
                this.getView().byId("inputIssuedById").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputIssuedById").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
                bValid = false;
            }
            else{
                this.getView().byId("inputIssuedById").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputIssuedById").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!this.isValidIssuedWhenDate){
                this.getView().byId("dpIssuedWhenId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dpIssuedWhenId").setValueStateText(this.getResourceBundle().getText("errorIssuedWhen"));
                bValid = false;
            }
            else{
                this.getView().byId("dpIssuedWhenId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("dpIssuedWhenId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (!(/^[0-9]{7}[A-Z][0-9]{3}[A-Z]{2}[0-9]$/.test(aInputValuesMap.get("inputIdentNumber")))){
                this.getView().byId("inputIdentNumberId").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("inputIdentNumberId").setValueStateText(this.getResourceBundle().getText("errorIdentNumber"));
                bValid = false;
            }
            else{
                this.getView().byId("inputIdentNumberId").setValueState(sap.ui.core.ValueState.Information);
                this.getView().byId("inputIdentNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            }

            if (aInputValuesMap.get("inputPhoneNumber") !== ""){
                if (aInputValuesMap.get("inputPhoneNumber").includes("_")){
                    this.getView().byId("inputPhoneNumberId").setValueState(sap.ui.core.ValueState.Error);
                    this.getView().byId("inputPhoneNumberId").setValueStateText(this.getResourceBundle().getText("errorPhoneNumber"));
                    bValid = false;
                }
                else{
                    this.getView().byId("inputPhoneNumberId").setValueState(sap.ui.core.ValueState.None);
                    this.getView().byId("inputPhoneNumberId").setValueStateText("");
                }
            }


            return bValid;
        },

        onBirthDateChange: function(oEvent) {
            this.isValidBirthDate = oEvent.getParameter("valid");
        },

        onIssuedWhenDateChange: function(oEvent) {
            this.isValidIssuedWhenDate = oEvent.getParameter("valid");
        },

        _initInputInputFields: function() {
            this.getView().byId("inputSurnameId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputSurnameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputNameId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputNameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputMiddleNameId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputMiddleNameId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("dpBirthDateId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("dpBirthDateId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selSexId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selSexId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputBirthPlaceId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputBirthPlaceId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selActResidenceCityId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selActResidenceCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputActResAddressId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputActResAddressId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selRegCityId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selRegCityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selMaritalStatusId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selMaritalStatusId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selCitizenshipId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selCitizenshipId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("selDisabilityId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("selDisabilityId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputPassportSeriesId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputPassportSeriesId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputPassportNumberId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputPassportNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputIssuedById").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputIssuedById").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("dpIssuedWhenId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("dpIssuedWhenId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputIdentNumberId").setValueState(sap.ui.core.ValueState.Information);
            this.getView().byId("inputIdentNumberId").setValueStateText(this.getResourceBundle().getText("obligatoryField"));
            this.getView().byId("inputPhoneNumberId").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("inputPhoneNumberId").setValueStateText("");
        }
    });
});
