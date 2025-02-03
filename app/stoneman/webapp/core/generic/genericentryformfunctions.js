sap.ui.define([
    "core/generic/genericentryformproperties",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller"
],
    function (genericentryformproperties, JSONModel) {
        "use strict";

        return genericentryformproperties.extend("coregeneric.genericentryformfunctions", {

            onInit: function () {

                genericentryformproperties.prototype.onInit.apply(this, arguments);

                this.router = sap.ui.core.UIComponent.getRouterFor(this);


            },


            identifyFormMode: function (oEvent) {
                //var oArguments = oEvent.getParameter('arguments');
                //0 - Find
                //1 - Ok
                //2- Edit/Update
                //3 - Add / New
                //4 - View
                //5 - Print
                //7 - Archive
                let obj, routeData;

                routeData = this.getRouteData();
                let sText = "";
                if (routeData !== "undefined") {

                    this.setFormMode(routeData.formMode);

                    //obj = JSON.parse(oEvent.data.data);

                    if (routeData.formMode == 1) {
                        // OK Mode
                        sText = "Okay";
                    }
                    else if (routeData.formMode == 2) {
                        // Edit Mode
                        this.setListViewEditPropertyValue(routeData.uniqueId);
                        sText = "Update";
                    }
                    else if (routeData.formMode == 3) {
                        //Add Mode
                        sText = "Add";
                    }

                    //var oButton = this.byId("EntryFormSaveButton");
                    //oButton.setText(sText);
                } else {
                    alert('FormMode');
                }

            },

            showEntryForm: async function (pageId) {

                if (this.getFormMode() == "2") {
                   await this.populateEntryForm("GET", this.getEntryFormDataSourceURLForEditMode(), "");
                }
                else if (this.getFormMode() == "3") {
                    if (this.getEntryFormDataSourceURLForNewMode().length > 0) {
                    await    this.populateEntryForm("GET", this.getEntryFormDataSourceURLForNewMode(), "");
                    }
                }

            },

            populateEntryForm: async function (oRequestType, aUrl, oRequestData) {
                // IF condition to be done to set getURLForFormModeNew or getURLForFormModeEdit
               await this.callApi(oRequestType, aUrl, oRequestData)
                    .then((data) => {
                        // writing like this .then ((data) => {}) gives the parent context, in this case the controller.
                        console.log('Success:', data);

                        var oModel = new JSONModel();
                        oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                        oModel.setData(data); // 'data' is the response from your API call
                        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                        //this.getView().setModel(oModel, "myModel");
                    })
                    .catch(function (error) {
                        console.error('Error:', error);
                    });

            },

            saveEntryForm: async function (oRequestType, aUrl, oRequestData) {
                // IF condition to be done to set getURLForFormModeNew or getURLForFormModeEdit
                await this.callApi(oRequestType, aUrl, oRequestData)
                    .then((data) => {
                        // writing like this .then ((data) => {}) gives the parent context, in this case the controller.
                        console.log('Success:', data);
                        var oModel = new JSONModel();
                        oModel.setData(data); // 'data' is the response from your API call
                        this.getView().setModel(oModel, this.getEntryFormResponseDataSourceModelName());

                       // on Sucess Clear everything
                         this.clearGenericEntryForm();//mansi
                    })
                    .catch(function (error) {
                        console.error('Error:', error);
                    });

            },

            clearGenericEntryForm: function () {
                // to clear all properties of generic entry form
                this.clearGenericListViewForm();
                this.createNewModel(this.getEntryFormDataSourceModelName());
            },




        });
    });
