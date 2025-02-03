

sap.ui.define([
    "core/generic/genericentryform",
    "sap/ui/model/json/JSONModel",
    "stoneman/modone/model/JSONLoader",
    "sap/m/MessageToast",
  ],
  
    function (genericentryform, JSONModel, JSONLoader, MessageToast) {
      "use strict";
  
      return genericentryform.extend("modonecontroller.usergroupmasterentryform", {
  
        onInit: function () {
          genericentryform.prototype.onInit.apply(this, arguments);


        //   const data = {
        //     items: [
        //         { selected: false, option1: false, option2: false, option3: false },
        //         { selected: false, option1: false, option2: false, option3: false },
        //         { selected: false, option1: false, option2: false, option3: false }
        //     ]
        // };
        
        // const oModel = new sap.ui.model.json.JSONModel(data);
        // this.getView().setModel(oModel);
        
         },
  
        initialize: function () {
          this.setPageId("usergrpmasterf"); // costing one pager entry form == copef
          this.setFormTitle("usergroupmasterentryform");
  
          this.setBackwardRoute("RouteNameUserGroupConfiguration");
  
          this.setEntryFormDataSourceURLForNewMode("");
  
          this.getParentMenuCodeModel();
  
  
  
          this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MUserGroup");
          this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MUserGroup(" + this.getListViewEditPropertyValue() + ")");
          this.setListViewFilterColumn();
          let oPath = jQuery.sap.getModulePath(
            "stoneman",
            "/modone/model/MenuMasterEntryForm.json", // Edit Response Model
          );
  
          let oModel = new sap.ui.model.json.JSONModel(oPath);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
  
          let oPathSaveReq = jQuery.sap.getModulePath(
            "stoneman",
            "/modone/model/MenuMasterSaveRequest.json", //Save Request Model
          );
          let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
          this.getView().setModel(oModelSaveRequest, "MenuMasterSaveRequestModel");
  
          //this.loadStaticDropdownModel();




          
  
  
  
        },
  
        onBeforeShow: async function (oEvent) {
          this.identifyFormMode(oEvent);
          this.initialize();
          this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MMenu(" + this.getListViewEditPropertyValue() + ")");
          await this.showEntryForm();
  
        },
  
        onSave: async function () {
          let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          let trgObject = this.getView().getModel("MenuMasterSaveRequestModel").getData();
  
          this.transferObjectValues(srcObject, trgObject);
          console.log('requestObject', trgObject)
          await this.onPressOfEntryFormSaveButton(trgObject);
          let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
          if (response) {
            MessageToast.show("Menu created successfully " + response.MenuId);
            setTimeout(function () {
              this.router.navTo(this.getBackwardRoute());
            }.bind(this), 500);
          }
  
        },


      
  
  
  
        // onSave: async function () {
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
  
        // loadStaticDropdownModel: function () {
        //   const copPayloadReqPath = '/modone/model/menumasterstatics.json';
        //   JSONLoader.loadJSONData(copPayloadReqPath)
        //     .then(
        //       function (data) {
        //         this.createNewModelUsingArray('MenuMasterStaticDropdownModel', data);
        //       }.bind(this)
        //     )
        //     .catch(function (error) {
        //       console.error(error);
        //     });
        // },
  
        // getParentMenuCodeModel: async function () {
        //   await this.createNewModelUsingAPI(
        //     "GET",
        //     `/odata/v4/stoneman-crf/MMenu`,
        //     "",
        //     "parentmenucodemodel"
        //   );
  
        //    const menuResponse = this.getView().getModel("menuresponsemodel");
        //    const apiModel = menuResponse.oData.value;
        //    this.getView().setModel(MenuMasterSaveRequestModel, "EntryFormDataSourceModel");
  
        //   console.log({ apiModel });
        // }
  
  
      });
    }
  );
  