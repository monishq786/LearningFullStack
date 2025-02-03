sap.ui.define([
  'core/generic/genericlistview'],
  function (genericlistview) {
    'use strict';

    return genericlistview.extend('modconfcontroller.menurolelistview', {
      onInit: function () {
        genericlistview.prototype.onInit.apply(this, arguments);
      },

      onBeforeShow: function () {
        this.initialize();
      },

      initialize: async function () {
        this.setPageId('pgmenurolelv');
        this.setFormTitle('{i18n>Titleformlistview}');
        //this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MMenuRoleAccess?$filter=DelMark eq 0 &$expand=Detail($expand=Menu),Role', "", 'value');
        this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MMenuRoleAccess?$expand=Detail($filter=DelMark eq 0) & $expand=Role &$filter=DelMark eq 0 ', "", 'value');
        this.setListViewDisplayColumns(['Role Code', 'Role Description ', 'EDIT']);
        this.setListViewDataColumns(['Role/RoleCode', 'Role/Description', 'Edit']);
        this.setListViewFilterColumn('mrRoleName', 'Role Code', 'Cfl', 'eq', 'String', 'Role_RoleGuid', 'cflForRole');
        this.setListViewEditProperty('MenuRoleAccessGuid');
        this.setForwardRoute('RouteNameMenuRolerentryform');
        this.setBackwardRoute("RouteLanding");
        this.setFormSubTitle('Search Results');
        await this.showListView(this.getPageId());
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
            console.log("Controll   " + JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
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
          console.log("Controll   " + controll);
          console.log("Afshans   " + JSON.stringify(roledata));
          const oTable = this.getListViewTable();
          const sCreateText = this.getView().getModel('i18n').getResourceBundle().getText('CREATE');
          for (const oControl of oTable.getHeaderToolbar().getContent()) {
            console.log("Controll   " + JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
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
                  if (oItem.getIcon() === "sap-icon://navigation-right-arrow") {
                    oItem.setEnabled(isView);
                  }
                }
              });
            }
          });
        });
      },

      cflForMenuName: async function () {
        this.setCflTitle('Menu List');
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MRole`,
          "",
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Role Name']);
        this.setCflDataColumns(['RoleCode_RoleConstant']);
        this.setCflValueAndDisplay('', '', 'mrMenuName', 'RoleCode_RoleConstant');
        this.setCflSearchProperty('RoleCode_RoleConstant');
        this.showCfl('mrMenuName', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForcflForRole.bind(this));
      },

      cflForRole: async function () {
        this.setCflTitle('Role List');
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0`,
          "",
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Role Code']);
        this.setCflDataColumns(['RoleCode']);
        this.setCflValueAndDisplay('', '', 'mrRoleName', 'RoleCode','RoleGuid');
        this.setCflSearchProperty('RoleCode');
        this.showCfl('mrRoleName', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForcflForRole.bind(this));
      },


      onClosecflForcflForRole: function () {
        let x = this.getCflObject();
      },



    });
  });
