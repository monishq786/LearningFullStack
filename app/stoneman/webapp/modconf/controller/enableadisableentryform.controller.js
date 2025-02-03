sap.ui.define([
  'core/generic/genericentryform',
  'sap/m/MessageBox'
], function (genericentryform, MessageBox) {
  'use strict';
  let formMode;
  let FormType;
  let RoleCode;
  var _RoleInfo = null, _LoginInfo;
  return genericentryform.extend('modconfcontroller.enableadisableentryform', {
    onInit: function () {
      genericentryform.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: async function (oEvent) {
      this.identifyFormMode(oEvent);
      this.initialize();

      await this.createNewModelUsingAPI('GET', `odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0&$filter=ParentMenuCode eq 'FORMS'`, '', 'formTypeModel');

      this.setEntryFormDataSourceURLForEditMode(
        '/odata/v4/stoneman-crf/MCrfControls(' + this.getListViewEditPropertyValue() + ')?$expand=Detail'
      );
      await this.showEntryForm();
    },

    initialize: async function () {
      _RoleInfo = this.getRoleDetails();
      _LoginInfo = this.getLoginInfo();
      this.setPageId('enableadisableef');
      formMode = this.getFormMode();
      this.setFormTitle('Control Enable & Disable');
      this.setBackwardRoute('RouterNameControlEnableDisable');
      this.setEntryFormDataSourceURLForNewMode("");

      this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MCrfControls');
      this.setEntryFormDataSourceURLToUpdateData('/odata/v4/stoneman-crf/MCrfControls/' + this.getListViewEditPropertyValue());
      if (formMode == '3') {
        let x = {
          RoleCode_RoleCode_RoleConstant: null,
          StageCode_StageCode_StageConstant: null,
          FormType: null,
          IsActive: false,
          Detail: [
            {
              ControlName: null,
              Enabled: false,
              TableName: null,
              ControlId: null,
              IsActive: 'N'
            }]
        }

        let oModel = new sap.ui.model.json.JSONModel(x);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

      }
      await this.ButtonDiable();
    },

    ButtonDiable: async function () {
      let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
      await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
      let myModel = this.getView().getModel("myModel").getData();
      const filteredData = myModel.value.filter(item => item.MenuCode);
      for (const Data of filteredData) {
        if (Data.Update == false && Data.MenuCode.MenuName == 'Manage Form controls') {
          let oView = this.getView();
          oView.byId('Enable_Button').setEnabled(false);
        }
      };
    },

    onSelect: function (oEvent) {
      const bSelected = oEvent.getParameter('selected');
      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

      if (bSelected === true) {
        y.setProperty(`/IsActive`, 'true');
      } else {
        y.setProperty(`/IsActive`, 'false');
      }
    },

    onSelectEnable: function (oEvent) {
      var oSource = oEvent.getSource();
      var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
      var rowIndex = oContext.getPath().split('/').pop();

      const bSelected = oEvent.getParameter('selected');
      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

      if (bSelected === true) {
        y.setProperty(`/Detail/${rowIndex}/Enabled`, true);
      } else {
        y.setProperty(`/Detail/${rowIndex}/Enabled`, false);
      }
    },

    onSelectActive: function (oEvent) {
      var oSource = oEvent.getSource();
      var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
      var rowIndex = oContext.getPath().split('/').pop();

      const bSelected = oEvent.getParameter('selected');
      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

      if (bSelected === true) {
        y.setProperty(`/Detail/${rowIndex}/IsActive`, 'Y');
      } else {
        y.setProperty(`/Detail/${rowIndex}/IsActive`, 'N');
      }
    },

    onSelectVisible: function (oEvent) {
      var oSource = oEvent.getSource();
      var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
      var rowIndex = oContext.getPath().split('/').pop();

      const bSelected = oEvent.getParameter('selected');
      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

      if (bSelected === true) {
        y.setProperty(`/Detail/${rowIndex}/Visible`, true);
      } else {
        y.setProperty(`/Detail/${rowIndex}/Visible`, false);
      }
    },

    onFormTypeChange: function (oEvent) {
      var oSelectedItem = oEvent.getParameter('selectedItem');
      var sSelectedText = oSelectedItem.getText();
      FormType = sSelectedText;

      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
      y.setProperty('/Menu_MenuGuid', oSelectedItem.getKey());
      y.setProperty('/FormType',FormType);

      this.byId('Role_Code_EntryForm').setEnabled(true);
    },

    cflForRoleCode: async function () {
      await this.createNewModelUsingAPI('GET', `/odata/v4/stoneman-crf/MMenuRoleAccess?$filter=DelMark eq 0&$expand=Detail($filter=MenuCode eq '${FormType}' and DelMark eq 0)`, '', this.getCflListViewDataSourceModelName());
      this.setCflDisplayColumns(['Role Code']);
      this.setCflDataColumns(['RoleCode']);
      this.setCflValueAndDisplay('/RoleCodeName', 'RoleCode', '', '');
      this.setCflSearchProperty('RoleCode');
      this.showCfl(
        'Role_Code_EntryForm',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForRoleCode.bind(this)
      );

      this.byId('Stage_Code_EntryForm').setEnabled(true);
    },
    onClosecflForRoleCode: function () {
      let x = this.getCflObject();
      RoleCode = x.RoleCode;

      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
      y.setProperty('/RoleCode_RoleGuid', x.Role_RoleGuid);

    },
    cflForStageCode: async function () {
      // /odata/v4/stoneman-crf/MStageRole?$filter=RoleCode eq 'QUALITY_TL' and DelMark eq 0
      await this.createNewModelUsingAPI('GET', `/odata/v4/stoneman-crf/MStageRole?$filter=RoleCode eq '${RoleCode}' and DelMark eq 0`, '', this.getCflListViewDataSourceModelName());
      this.setCflDisplayColumns(['StageCode']);
      this.setCflDataColumns(['StageCode']);
      this.setCflValueAndDisplay('/StageCodeName', 'StageCode', '', '');
      this.setCflSearchProperty('StageCode');
      this.showCfl(
        'Stage_Code_EntryForm',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForStageCode.bind(this)
      );
    },
    onClosecflForStageCode: function () {
      let x = this.getCflObject();

      const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
      y.setProperty('/StageCode_StageGuid', x.Stage_StageGuid);
    },


    isValidate: function () {
      let isValid = true;
      const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
      if (y.FormType == undefined || y.FormType == null) {
        isValid = false;
        sap.m.MessageToast.show('Please select Form Type');
      }
      else if (y.RoleCodeName == undefined || y.RoleCodeName == null) {
        isValid = false;
        sap.m.MessageToast.show('Please select Role Code');
      }
      else if (y.StageCodeName == undefined || y.StageCodeName == null) {
        isValid = false;
        sap.m.MessageToast.show('Please select Stage Code');
      }

      return isValid;
    },

    createObjectTarget: function () {
      const x = {
        FormType: null,
        IsActive: null,
        Menu_MenuGuid: null,
        RoleCodeName: null,
        RoleCode_RoleGuid: null,
        StageCodeName: null,
        StageCode_StageGuid: null,
        Detail: [
          {
            ControlId: null,
            ControlName: null,
            Enabled: null,
            TableName: null,
            ControlId: null,
            IsActive: null,
            Visible: null
          }]
      };
      return x;
    },
    addRow: function () {
      var newRow = {
        ControlName: null,
        Enabled: null,
        TableName: null,
        ControlId: null,
        IsActive: null,
        RowNumber: 0
      };
      this.addRowInObj('Detail', newRow, 'RowNumber');
    },

    onDeleteControlDetail: function (oEvent) {
      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
      this.deleteRow(this.getEntryFormDataSourceModelName(), 'Detail', iIndex);
    },

    onSave: async function () {
      if (this.isValidate()) {
        let modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        modelData.Detail.forEach(element => {
          element.IsActive == 'Y' ? true : false
        });
        let y = this.createObjectTarget();

        this.transferObjectValues(modelData, y);

        console.log(y);
        await this.onPressOfEntryFormSaveButton(y);
        const res = this.getApiResponseObject();
        if (res.success === true) {
          //message of success
          setTimeout(
            function () {
              this.router.navTo(this.getBackwardRoute());
            }.bind(this),
            500
          );
        } else {
        }
      }
    }
  })
});