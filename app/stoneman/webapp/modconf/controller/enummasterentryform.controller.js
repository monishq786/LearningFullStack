

sap.ui.define([
    "core/generic/genericentryform",
    "sap/ui/model/json/JSONModel",
    "stoneman/modone/model/JSONLoader",
    "sap/m/MessageToast",
],

    function (genericentryform, JSONModel, JSONLoader, MessageToast) {
        "use strict";
        let formMode;
        var _RoleInfo = null, _LoginInfo;


        return genericentryform.extend("modconfcontroller.enummasterentryform", {

            onInit: function () {
                _RoleInfo = this.getRoleDetails();
                _LoginInfo = this.getLoginInfo();
                genericentryform.prototype.onInit.apply(this, arguments);
                //this.initialize();
            },

            initialize: async function () {
                this.setPageId("enummasterf"); // costing one pager entry form == copef
                this.setFormTitle("enummasterentryform");

                this.setBackwardRoute("RouteNameEnumConfiguration");
                formMode = this.getFormMode();

                this.setEntryFormDataSourceURLForNewMode("");

                // this.getParentMenuCodeModel();




                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MEnum");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MEnum(" + this.getListViewEditPropertyValue() + ")");
                this.setListViewFilterColumn();

                let oPath = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modconf/model/EnumMasterAddViewForm.json", // Edit Response Model
                );

                let oModel = new sap.ui.model.json.JSONModel(oPath);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

                let oPathSaveReq = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modconf/model/EnumMasterSaveForm.json", //Save Request Model
                );
                let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
                this.getView().setModel(oModelSaveRequest, "EnumMasterSaveModel");
                console.log("This is Form mode for test ===================>", formMode);
                if (formMode == '3') {
                    let y = {
                        EnableMenuCode: true
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');


                }
                else {
                    (formMode == '2')

                    let y = {
                        EnableMenuCode: false
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                }

                //this.loadStaticDropdownModel();
                // await this.ButtonDiable();


            },

            //   ButtonDiable: async function () {
            //     let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
            //     await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
            //     let myModel = this.getView().getModel("myModel").getData();
            //     const filteredData = myModel.value.filter(item => item.MenuCode);
            //     for (const Data of filteredData) {
            //         if (Data.Update == false && Data.MenuCode.MenuName == 'Menu Configuration') {
            //             let oView = this.getView();
            //             oView.byId('MenuMaster_Button').setEnabled(false);
            //         }
            //     };
            // },

            onBeforeShow: async function (oEvent) {
                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MEnum(" + this.getListViewEditPropertyValue() + ")");
                await this.showEntryForm();

            },

            onSave: async function () {
                let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                let trgObject = this.getView().getModel("EnumMasterSaveModel").getData();

                this.transferObjectValues(srcObject, trgObject);
                console.log('requestObject', trgObject)
                await this.onPressOfEntryFormSaveButton(trgObject);
                let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
                if (response) {
                    MessageToast.show("Enum created successfully " + response.EnumGuid);
                    setTimeout(function () {
                        this.router.navTo(this.getBackwardRoute());
                    }.bind(this), 500);
                }

            },




            //   // Get source and target objects
            //   let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            //   let trgObject = this.getView().getModel("MenuMasterSaveRequestModel").getData();

            //   // Assuming we want to gather selected items from srcObject
            //   const selectedItems = srcObject.items.filter(item => item.selected); // Adjust this logic based on your data structure

            //   if (selectedItems.length === 0) {
            //     MessageToast.show("No items selected for saving.");
            //     return;
            //   }

            //   // Transfer values from the source to the target object
            //   this.transferObjectValues(srcObject, trgObject);

            //   // Add the selected items to the target object
            //   trgObject.selectedItems = selectedItems; // Adjust this structure based on your API requirements

            //   console.log('requestObject', trgObject);

            //   try {
            //     // Call the function to handle the actual save
            //     await this.onPressOfEntryFormSaveButton(trgObject);
            //     let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();

            //     if (response) {
            //       MessageToast.show("Menu created successfully: " + response.MenuId);
            //       setTimeout(function () {
            //         this.router.navTo(this.getBackwardRoute());
            //       }.bind(this), 500);
            //     }
            //   } catch (error) {
            //     console.error("Error saving data:", error);
            //     MessageToast.show("Error saving data.");
            //   }
            // },


            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },






            // cflForMenuCode: async function () {
            //   let Ourl = `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'MENUCODE'`;
            //   await this.createNewModelUsingAPI('GET', Ourl, '', this.getCflListViewDataSourceModelName());
            //   this.setCflDisplayColumns(['Menu Code']);
            //   this.setCflDataColumns(['EnumCode']);
            //   this.setCflValueAndDisplay("menucod", "EnumCode", '', '');
            //   this.showCfl("menucod", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageCode.bind(this));
            // },

            // onClosecflForStageCode: function () {
            //   let { EnumCode } = this.getCflObject();
            //   let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            //   viewModel.setProperty(`/MENUCODE`, EnumCode);
            // },









        });
    }
);
