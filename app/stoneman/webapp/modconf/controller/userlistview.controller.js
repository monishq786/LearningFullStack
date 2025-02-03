sap.ui.define(['core/generic/genericlistview'], function (genericlistview) {
  'use strict';

  return genericlistview.extend('modconfcontroller.userlistview', {
    onInit: function () {
      genericlistview.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: function (oEvent) {
      // this.validateAccess();
      this.initialize();
    },

    initialize: async function () {
      this.setPageId('userlv');
      this.setFormTitle('User Configuration Search Form');
      this.setFormSubTitle('');

      this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MUser?$expand=Role', '', 'value');

      this.setListViewDisplayColumns(['userCode', 'userName', 'deptCode', 'deptName', 'userRoleCode', 'Edit']);
      this.setListViewDataColumns(['UserCode', 'UserName', 'DepartmentCode', 'DepartmentName', 'Role/Description', 'Edit']);
      //
      this.setListViewFilterColumn('userlvInpUser', 'User Name', 'Cfl', 'eq', 'String', 'UserName', 'cflForUser');
      this.setListViewFilterColumn(
        'userlvInpDepartment',
        'Department Name',
        'Cfl',
        'eq',
        'String',
        'DepartmentName',
        'cflForDepartment'
      );
      this.setListViewFilterColumn(
        'userlvInpUserRoleCode',
        'User Role Code',
        'Cfl',
        'eq',
        'String',
        'Role_RoleGuid',
        'cflForUserRoleCode'
      );
      this.setListViewEditProperty('UserGuid');
      this.setForwardRoute('RouteUserEntryForm');
      this.setBackwardRoute('RouteLanding');
      this.showListView(this.getPageId());
      await this.pageValidatations();
    },

    pageValidatations: function () {
      const configuralModel = this.getOwnerComponent().getModel('configuralModel');
      if (configuralModel) {
        const roledata = configuralModel?.getData();
        localStorage.setItem('roledata', JSON.stringify(roledata));
        console.log('roledata    ', roledata);
        const oTable = this.getListViewTable();
        const sCreateText = this.getView().getModel('i18n').getResourceBundle().getText('CREATE');
        for (const oControl of oTable.getHeaderToolbar().getContent()) {
          console.log('Controll   ' + JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
          if (oControl.isA('sap.m.Button') && oControl.getText() === sCreateText) {
            localStorage.setItem('Controll', JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
            oControl.setEnabled(roledata?.Add);
            break;
          }
        }
        this.disableAllEditButtons(roledata?.View);
      } else {
        const roledata = JSON.parse(localStorage.getItem('roledata'));
        const controll = JSON.parse(localStorage.getItem('Controll'));
        console.log('Controll   ' + controll);
        console.log('Afshans   ' + JSON.stringify(roledata));
        const oTable = this.getListViewTable();
        const sCreateText = this.getView().getModel('i18n').getResourceBundle().getText('CREATE');
        for (const oControl of oTable.getHeaderToolbar().getContent()) {
          console.log('Controll   ' + JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
          if (oControl.isA('sap.m.Button') && oControl.getText() === sCreateText) {
            oControl.setEnabled(roledata?.Add);
            break;
          }
        }
        this.disableAllEditButtons(roledata?.View);
      }
    },

    disableAllEditButtons: function (isView) {
      const oTable = this.getListViewTable();
      var aItems = oTable.getItems();
      // Iterate over each item (row)
      aItems.forEach(function (oItem) {
        // Get the cells of the current row (ColumnListItem)
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          if (oCell instanceof sap.m.HBox) {
            var aItems = oCell.getItems(); // Get the items inside the HBox
            aItems.forEach(function (oItem) {
              if (oItem instanceof sap.m.Button) {
                if (oItem.getIcon() === 'sap-icon://navigation-right-arrow') {
                  oItem.setEnabled(isView);
                }
              }
            });
          }
        });
      });
    },

    cflForUser: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata/sap/YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Business Partner', 'Business Partner Full Name', 'BusinessPartnerUUID']);
      this.setCflDataColumns(['BusinessPartner', 'BusinessPartnerFullName', 'BusinessPartnerUUID']);
      this.setCflValueAndDisplay('', '', 'userlvInpUser', 'BusinessPartnerFullName');
      this.showCfl('user', this.getCflListViewDataSourceModelName(), 'd/results', this.onClosecflForUser.bind(this));
    },

    onClosecflForUser: function () {
      let x = this.getCflObject();
    },

    cflForDepartment: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata4/sap/api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Department Code', 'Department Name', 'Department Description']);
      this.setCflDataColumns(['CostCenter', 'CostCenterName', 'CostCenterDescription']);
      this.setCflValueAndDisplay('', '', 'userlvInpDepartment', 'CostCenterName');
      this.showCfl(
        'userlvInpDepartment',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForDepartment.bind(this)
      );
    },
    onClosecflForDepartment: function () {
      let x = this.getCflObject();
    },

    cflForUserRoleCode: async function () {
      await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MRole', '', this.getCflListViewDataSourceModelName());
      this.setCflDisplayColumns(['Role Name']);
      this.setCflDataColumns(['Description']);
      this.setCflValueAndDisplay('', '', 'userlvInpUserRoleCode', 'Description', 'RoleGuid');
      this.setCflSearchProperty('Description');
      this.showCfl(
        'userlvInpUserRoleCode',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForRoleCode.bind(this)
      );
    },

    onClosecflForRoleCode: function () {
      let x = this.getCflObject();
    },

    onClosecflForCrfTech: function () {
      let x = this.getCflObject();
    },

    cflForCrfStatus: function () { },

    onClosecflForCrfStatus: function () {
      let x = this.getCflObject();
    },
    dataPickerForDate: function () { },
    selectForBuyer: function () { }
  });
});
