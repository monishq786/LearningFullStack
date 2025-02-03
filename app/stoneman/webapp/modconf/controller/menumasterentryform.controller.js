

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


    return genericentryform.extend("modconfcontroller.menumasterentryform", {

      onInit: function () {
        _RoleInfo = this.getRoleDetails();
        _LoginInfo = this.getLoginInfo();
        genericentryform.prototype.onInit.apply(this, arguments);
        //this.initialize();
      },

      initialize: async function () {
        this.setPageId("menumasterf"); // costing one pager entry form == copef
        this.setFormTitle("menumasterentryform");

        this.setBackwardRoute("RouteNameMenuConfiguration");
        formMode = this.getFormMode();

        this.setEntryFormDataSourceURLForNewMode("");

        this.getParentMenuCodeModel();




        this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MMenu");
        this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MMenu(" + this.getListViewEditPropertyValue() + ")");
        this.setListViewFilterColumn();

        let oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/modconf/model/MenuMasterEntryForm.json", // Edit Response Model
        );

        let oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

        let oPathSaveReq = jQuery.sap.getModulePath(
          "stoneman",
          "/modconf/model/MenuMasterSaveRequest.json", //Save Request Model
        );
        let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
        this.getView().setModel(oModelSaveRequest, "MenuMasterSaveRequestModel");
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
        this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MMenu(" + this.getListViewEditPropertyValue() + ")");
        await this.showEntryForm();

      },

      onSave: async function () {
        if (this.isFormValid()){

      
        let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        srcObject.ParentMenuCode= srcObject.MenuCode == '-1'? null: srcObject.ParentMenuCode;
        let trgObject = this.getView().getModel("MenuMasterSaveRequestModel").getData();
        console.log("SRC OBJ", srcObject)

        this.transferObjectValues(srcObject, trgObject);

        await this.onPressOfEntryFormSaveButton(trgObject);
        console.log('target-------', trgObject)
        console.log('srcobj-------', trgObject)
        // let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
        let response = this.getApiResponseObject();

        console.log("response---",response)
        if (response.success) {
          MessageToast.show("Menu created successfully ");
          setTimeout(function () {
            this.router.navTo(this.getBackwardRoute());
          }.bind(this), 500);
        }else {
          MessageToast.show(response.object.responseJSON.error.message);
          // sap.m.MessageBox.error("Duplicate Entry detected");
        
        }
      }
      },

      isFormValid: function () {
        let isValid = true;

        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        const MenuCode = y.getProperty('/MenuCode');
        const MenuPath = y.getProperty('/MenuPath');
        const ParentMenuCode = y.getProperty('/ParentMenuCode');
        const OrderBy = y.getProperty('/OrderBy');
        const Active = y.getProperty('/IsActive');

        const oData = y.getData();

        if (
            (MenuCode === undefined || MenuCode === null || MenuCode === '') &&
            (MenuPath === undefined || MenuPath === null || MenuPath === '') &&
            (ParentMenuCode === undefined || ParentMenuCode === null || ParentMenuCode === '') &&
            (OrderBy === undefined || OrderBy === null || OrderBy === '') &&
            (Active === undefined || Active === null || Active === '')
        ) {
            isValid = false;
            MessageToast.show('All Field is mandatory, Please Field data!');
            return isValid;
        } else if (MenuCode === undefined || MenuCode === null || MenuCode === '') {
            isValid = false;
            MessageToast.show('Please Enter Template Code!');
            return isValid;
        } else if (MenuCode !== '-1' && ( ParentMenuCode === undefined || ParentMenuCode === null || ParentMenuCode === '' )) {
          isValid = false;
          MessageToast.show('Please Enter ParentMenuCode !');
          return isValid;
        } else if (MenuPath === undefined || MenuPath === null || MenuPath === '') {
            isValid = false;
            MessageToast.show('Please Enter MenuPath !');
            return isValid;
        }  else if (OrderBy === undefined || OrderBy === null || OrderBy === '') {
          isValid = false;
          MessageToast.show('Please Enter OrderBy !');
          return isValid;
        } else if (Active === undefined || Active === null || Active === '') {
          isValid = false;
          MessageToast.show('Please Enter Active !');
          return isValid;
       }
        

        return isValid;
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
      //     "/odata/v4/stoneman-crf/MEnum?$filter=DelMark eq 0",
      //     "",
      //     "menuresponsemodel"
      //   );

      //   const menuResponse = this.getView().getModel("menuresponsemodel");
      //   let aData = menuResponse.getData();
      //   aData.value.unshift({ EnumCode: 'Please Select' });
      //   menuResponse.setData(aData);
      //   this.getView().setModel(menuResponse, "menuresponsemodel");
      //   console.log(this.getView().getModel("menuresponsemodel").getData());
      //   //console.log({ apiModel });
      // }


      getParentMenuCodeModel: async function () {
        await this.createNewModelUsingAPI('GET', "/odata/v4/stoneman-crf/MMenu?$filter=ParentMenuCode eq -1", '', 'ParentMenucodetemp');
        this.populateSelect('fieldTypeLbl', 'ParentMenucodetemp', 'value', 'MenuCode', 'MenuCode');
      },


      cflForMenuCode: async function () {
        let Ourl = `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'MENUCODE'`;
        await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(['Menu Code']);
        this.setCflDataColumns(['EnumCode']);
        this.setCflValueAndDisplay("menucod", "EnumCode", '', '');
        this.showCfl("menucod", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageCode.bind(this));
      },

      onClosecflForStageCode: function () {
        let { EnumCode } = this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/MenuCode`, EnumCode);
        viewModel.setProperty(`/Description`, EnumCode);
      },

      cflForParentMenuCode: async function () {
        let Ourl = `/odata/v4/stoneman-crf/MMenu`;
        await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(['Menu Code','Parent Menu Code']);
        this.setCflDataColumns(['MenuCode', 'ParentMenuCode']);
        this.setCflValueAndDisplay("/ParentMenuCode", "MenuCode", '', '', 'MenuGuid');
        this.showCfl("parentmenucode", this.getCflListViewDataSourceModelName(), "value", this.onClosecflParentMenuCode.bind(this));
      },

      onClosecflParentMenuCode: function () {
        let x= this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/ParentMenuCode`, x.MenuCode);
        viewModel.setProperty(`/ParentMenuGuid_MenuGuid`, x.MenuGuid);
      },


      onSelect: function (oEvent) {
        const bSelected = oEvent.getParameter('selected');
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        if (bSelected === true) {
          y.setProperty(`/IsActive`, 'Y');
        } else {
          y.setProperty(`/IsActive`, 'N');
        }
      },






    });
  }
);
