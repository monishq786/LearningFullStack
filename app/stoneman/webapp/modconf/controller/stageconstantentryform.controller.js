

sap.ui.define([
    "core/generic/genericentryform",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
],

    function (genericentryform, JSONModel, MessageToast) {
        "use strict";

        return genericentryform.extend("modconfcontroller.stageconstantentryform", {

            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                this.initialize();
            },

            initialize: function () {
                this.setPageId("stageconstantf"); // costing one pager entry form == copef
                this.setFormTitle("stageconstantentryform");

                this.setBackwardRoute("RouteNameStageConstantConfiguration");

                this.setEntryFormDataSourceURLForNewMode("");



                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MStageConstant");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MStageConstant(" + this.getListViewEditPropertyValue() + ")");
                this.setListViewFilterColumn();
                let oPath = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modconf/model/StageConstantEntryForm.json", // Edit Response Model
                );

                let oModel = new sap.ui.model.json.JSONModel(oPath);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

                let oPathSaveReq = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modconf/model/StageConstantSaveRequest.json", //Save Request Model
                );
                let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
                this.getView().setModel(oModelSaveRequest, "StageConstantSaveRequest");

                //this.loadStaticDropdownModel();



            },

            onBeforeShow: async function (oEvent) {
                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MStageConstant('" + this.getListViewEditPropertyValue() + "')");
                await this.showEntryForm();

            },

            onSave: async function () {
                let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                let trgObject = this.getView().getModel("StageConstantSaveRequest").getData();

                this.transferObjectValues(srcObject, trgObject);
                console.log('requestObject', trgObject)
                await this.onPressOfEntryFormSaveButton(trgObject);
                let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
                if (response) {
                    MessageToast.show("Stage Constant created successfully " + response.StageConstant);
                    setTimeout(function () {
                        this.router.navTo(this.getBackwardRoute());
                    }.bind(this), 500);
                }

            },




            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },

        });
    }
);
