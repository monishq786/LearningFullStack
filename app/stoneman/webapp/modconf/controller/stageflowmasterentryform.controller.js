

sap.ui.define([
  "core/generic/genericentryform",
  "sap/ui/model/json/JSONModel",
  "stoneman/modone/model/JSONLoader",
  "sap/m/MessageToast",
],

  function (genericentryform, JSONModel, JSONLoader, MessageToast) {
    "use strict";
    var _RoleInfo = null, _LoginInfo;

    return genericentryform.extend("modconfcontroller.stageflowmasterentryform", {

      onInit: function () {
        genericentryform.prototype.onInit.apply(this, arguments);
        this.initialize();
      },

      initialize:async function () {
        _RoleInfo = this.getRoleDetails();
        _LoginInfo = this.getLoginInfo()
        this.setPageId("stageflowmasterf"); // costing one pager entry form == copef
        this.setFormTitle("stageflowmasterentryform");

        this.setBackwardRoute("RouteNameStageFlowMasterConfiguration");

        this.setEntryFormDataSourceURLForNewMode("");

        this.getFlowStageCode();
        this.getCurrentStageCode();
        this.loadStaticDropdownModel();



        this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MStageFlow");
        this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MStageFlow(" + this.getListViewEditPropertyValue() + ")");
        this.setListViewFilterColumn();
        let oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/modconf/model/StageFlowMasterEntryForm.json", // Edit Response Model
        );

        let oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

        let oPathSaveReq = jQuery.sap.getModulePath(
          "stoneman",
          "/modconf/model/StageFlowMasterSaveRequest.json", //Save Request Model
        );
        let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
        this.getView().setModel(oModelSaveRequest, "StageFlowMasterSaveRequest");

        //this.loadStaticDropdownModel();

        await this.ButtonDiable();

      },

      ButtonDiable: async function () {
        let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
        await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
        let myModel = this.getView().getModel("myModel").getData();
        const filteredData = myModel.value.filter(item => item.MenuCode);
        for (const Data of filteredData) {
            if (Data.Update == false && Data.MenuCode.MenuName == 'Stage Flow Configuration') {
                let oView = this.getView();
                oView.byId('StageFlow_Button').setEnabled(false);
            }
        };
    },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MStageFlow(" + this.getListViewEditPropertyValue() + ")");
        await this.showEntryForm();

      },

      onSave: async function () {
        let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        let trgObject = this.getView().getModel("StageFlowMasterSaveRequest").getData();

        this.transferObjectValues(srcObject, trgObject);
        console.log('requestObject', trgObject)
        await this.onPressOfEntryFormSaveButton(trgObject);
        let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
        if (response) {
          MessageToast.show("Stage Flow created successfully " + response.StageFlowID);
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



      cflForgetFlowStageCode: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MStage`,
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['CurrentStageCode']);
        this.setCflDataColumns(['StageCode_StageConstant']);
        this.setCflValueAndDisplay('currentStageCode', 'StageCode_StageConstant', '', '');
        this.showCfl(
          'currentStageCode',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmCurrentStageCode.bind(this)
        );
      },






      onConfirmCurrentStageCode: function () {
        let x = this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/CurrentStageCode_StageCode_StageConstant`, x.StageCode_StageConstant);
        viewModel.setProperty(`/NextStageCode_StageCode_StageConstant`, x.StageCode_StageConstant);

      },


      cflForgetFormType: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MMenu`,
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['MenuName']);
        this.setCflDataColumns(['MenuName']);
        this.setCflValueAndDisplay('formtype', 'MenuName', '', '');
        this.showCfl(
          'formtype',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmFormType.bind(this)
        );
      },

      onConfirmFormType: function () {
        let x = this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty("/FormType", x.MenuName);
        viewModel.setProperty("/MenuCode", x.MenuCode);


      },



      cflForgetEmailTemplate: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MEmailTemplate`,
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['EmailTemplateCode']);
        this.setCflDataColumns(['EmailTemplateCode']);
        this.setCflValueAndDisplay('email', 'EmailTemplateCode', '', '');
        this.showCfl(
          'email',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmEmailTemplate.bind(this)
        );
      },

      onConfirmEmailTemplate: function () {
        let x = this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty("/EmailTemplateCode", x.EmailTemplateCode);
        viewModel.setProperty("/EmailTemplateID_EmailTemplateID", x.EmailTemplateID);


      },


      loadStaticDropdownModel: function () {
        const copPayloadReqPath = '/modconf/model/menumasterstatics.json';
        JSONLoader.loadJSONData(copPayloadReqPath)
          .then(
            function (data) {
              this.createNewModelUsingArray('MenuMasterStaticDropdownModel', data);
            }.bind(this)
          )
          .catch(function (error) {
            console.error(error);
          });
      },







      getFlowStageCode: async function () {
        await this.createNewModelUsingAPI(
          "GET",
          `/odata/v4/stoneman-crf/MMenu`,
          "",
          "menuresponsmodel"
        );

        const stageResponse = this.getView().getModel("menuresponsmodel");
        let aData = stageResponse.getData();
        // const apiModel = stageResponse.oData.value;
        aData.value.unshift({ MenuCode: 'Please Select' });
        stageResponse.setData(aData);
        this.getView().setModel(stageResponse, "menuresponsmodel");

        //     console.log({ apiModel });
      },



      getCurrentStageCode: async function () {
        await this.createNewModelUsingAPI(
          "GET",
          `/odata/v4/stoneman-crf/MStageFlow`,
          "",
          "stageresponsmodel"
        );

        const stageResponse = this.getView().getModel("stageresponsmodel");
        let aData = stageResponse.getData();
        // const apiModel = stageResponse.oData.value;
        aData.value.unshift({ StageCode: 'Please Select' });
        stageResponse.setData(aData);
        this.getView().setModel(stageResponse, "stageresponsmodel");

        //     console.log({ apiModel });
      },


      loadStaticDropdownModel: function () {
        const copPayloadReqPath = '/modconf/model/Seneriostatics.json';
        JSONLoader.loadJSONData(copPayloadReqPath)
          .then(
            function (data) {
              this.createNewModelUsingArray('senerioStaticDropdownModel', data);
            }.bind(this)
          )
          .catch(function (error) {
            console.error(error);
          });
      },

      // getMenuCodeModel: async function () {
      //   await this.createNewModelUsingAPI(
      //     "GET",
      //     `/odata/v4/stoneman-crf/MMenu`,
      //     "",
      //     "menuresponsmodel"
      //   );

      //   const menuResponse = this.getView().getModel("menuresponsemodel");
      //   let aData = menuResponse.getData();
      //   //const apiModel = menuResponse.oData.value;
      //   //aData.value.unshift({ MenuCode: 'Please Select' });
      //   menuResponse.setData(aData);
      //   this.getView().setModel(menuResponse, "menuresponsemodel");

      //   //console.log({ apiModel });
      // }


    });
  }
);
