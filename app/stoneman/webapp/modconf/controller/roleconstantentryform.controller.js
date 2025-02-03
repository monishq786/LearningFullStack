
sap.ui.define([
    "core/generic/genericentryform",
    "sap/ui/model/json/JSONModel",
    "stoneman/modone/model/JSONLoader",
    "sap/m/MessageToast",
],

    function (genericentryform, JSONModel, JSONLoader, MessageToast) {
        "use strict";
        let formMode;


        return genericentryform.extend("modconfcontroller.roleconstantentryform", {

            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                this.initialize();
            },

            initialize: function () {
                this.setPageId("roleconstantef"); // costing one pager entry form == copef
                this.setFormTitle("RoleConstantEnteryFormTitle");

                this.setBackwardRoute("RouterNameRoleConstantlistview");
                formMode = this.getFormMode();
                this.setEntryFormDataSourceURLForNewMode("");
                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MRoleConstant");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MRoleConstant('" + this.getListViewEditPropertyValue() + "')");
                this.setListViewFilterColumn();

                if (formMode == '3') {
                    let y = {
                        EnableRoleCode: true
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                    let x = {
                        RoleName: null,
                        RoleCode_RoleConstant: null,
                        IsActive: true,
                    }
                    let oModel = new sap.ui.model.json.JSONModel(x);
                    this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

                }
                if (formMode == '2') {

                    let y = {
                        EnableRoleConstant: false
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                }


            },

            onBeforeShow: async function (oEvent) {
                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MRoleConstant('" + this.getListViewEditPropertyValue() + "')");
                await this.showEntryForm();

            },

            isValidate: function () {
                let isValid = true;
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                if (y.RoleConstant == undefined || y.RoleConstant == null || y.RoleConstant.trim() == '') {
                    isValid = false;
                    sap.m.MessageToast.show('Please Enter Role Constant');
                }
                // if (y.RoleCode_RoleConstant == undefined || y.RoleCode_RoleConstant == null || y.RoleCode_RoleConstant.trim() == '') {
                //   isValid = false;
                //   sap.m.MessageToast.show('Please select Role Code');
                // }

                return isValid;
            },

            onSave: async function () {
                if (this.isValidate()) {
                    let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                    let x = {
                        RoleConstant: null,
                        IsActive: true
                    }

                    this.transferObjectValues(srcObject, x);
                    // console.log(srcObject, "==========================>", x)
                    await this.onPressOfEntryFormSaveButton(x);

                    let response = this.getApiResponseObject();;
                    // console.log("==============response=======>", response)
                    if (response.success) {
                        MessageToast.show("Role Constant created successfully with Role Constant: " + response.object.RoleConstant);
                        setTimeout(function () {
                            this.router.navTo(this.getBackwardRoute());
                        }.bind(this), 500);
                    } else {
                        MessageToast.show(response.object.responseJSON.error.message);
                    }
                }
            },

            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },




        });
    }
);
