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


    return genericentryform.extend("modconfcontroller.roleentryform", {

      onInit: function () {
        genericentryform.prototype.onInit.apply(this, arguments);
        this.initialize();
      },

      initialize: async function () {
        _RoleInfo = this.getRoleDetails();
        this.setPageId("roletef"); // costing one pager entry form == copef
        this.setFormTitle("RoleCodeEnteryFormTitle");

        this.setBackwardRoute("RouterNameRole");
        formMode = this.getFormMode();
        this.setEntryFormDataSourceURLForNewMode("");
        this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MRole");
        this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MRole('" + this.getListViewEditPropertyValue() + "')");
        this.setListViewFilterColumn();

        if (formMode == '3') {
          let y = {
            EnableRoleCode: true
          }
          var oModel1 = new JSONModel(y);
          oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
          let x = {
            "Description": null,
            "Remarks": null,
            "RoleCode": null
          }
          let oModel = new sap.ui.model.json.JSONModel(x);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

        }
        if (formMode == '2') {

          let y = {
            EnableRoleCode: false
          }
          var oModel1 = new JSONModel(y);
          oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
        }
        await this.ButtonDiable();

      },

      ButtonDiable: async function () {
        let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
        await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
        let myModel = this.getView().getModel("myModel").getData();
        const filteredData = myModel.value.filter(item => item.MenuCode);
        for (const Data of filteredData) {
          if (Data.Update == false && Data.MenuCode.MenuName == 'Role Configuration') {
            console.log("/.... " + _RoleInfo);
            let oView = this.getView();
            oView.byId('Role_Button').setEnabled(false);
          }
        };
      },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MRole('" + this.getListViewEditPropertyValue() + "')");
        await this.showEntryForm();

      },

      isValidate: function () {
        let isValid = true;
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        // if (y.RoleName == undefined || y.RoleName == null || y.RoleName.trim() == '') {
        //   isValid = false;
        //   sap.m.MessageToast.show('Please select Role Name');
        // }
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
            "Description": null,
            "Remarks": null,
            "RoleCode": null
          }

          this.transferObjectValues(srcObject, x);
          await this.onPressOfEntryFormSaveButton(x);

          let response = this.getApiResponseObject();;
          console.log("Response--------",response)
          if (response.success) {
            MessageToast.show("Role created successfully with Role Code: " + response.object.RoleCode);
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

      cflForRoleCode: async function () {
        let Ourl = `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'ROLECODE'`;
        await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(['Role Code']);
        this.setCflDataColumns(['EnumCode']);
        this.setCflValueAndDisplay("RoleCodei", "EnumCode", '', '');
        this.showCfl("RoleCodei", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageCode.bind(this));
      },

      onClosecflForStageCode: function () {
        let { EnumCode } = this.getCflObject();
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/RoleCode`, EnumCode);
        viewModel.setProperty(`/Description`, EnumCode);
      },




    });
  }
);

