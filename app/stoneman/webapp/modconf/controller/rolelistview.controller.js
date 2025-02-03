sap.ui.define([
  "core/generic/genericlistview",

],

  function (genericlistview) {
    "use strict";

    return genericlistview.extend("modconfcontroller.rolelistview", {

      onInit: function () {
        genericlistview.prototype.onInit.apply(this, arguments);

      },

      onBeforeShow: function (oEvent) {
        //this.validateAccess();
        this.initialize();

      },

      initialize: async function () {
        this.setPageId("roletlv"); // XML page ID // page title
        this.setFormTitle("{i18n>RoleListViewPageTitle}");
        this.setFormSubTitle("");


        this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0", "", "value");
        this.setListViewDisplayColumns(["RoleCode", "RoleDescription",  "action"]);
        this.setListViewDataColumns(["RoleCode", "Description",   "Edit"]);

        this.setListViewFilterColumn("rolecodeflv", "RoleCode", "Cfl", "eq", "String", "RoleCode", "cflForRoleCode");
        this.setListViewFilterColumn("rolenameflv", "RoleDescription", "Cfl", "eq", "String", "Description", "cflForRoleName");
        await this.showListView(this.getPageId());
        this.setListViewEditProperty("RoleGuid"); // TODO to be change based on requirments
        this.setForwardRoute("RouterNameRoleeentryform");
        this.setBackwardRoute("RouteLanding");

        await this.pageValidatations();
      },

      cflForRoleCode: async function () {
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["RoleCode"]);
        this.setCflDataColumns(["RoleCode"]);
        this.setCflValueAndDisplay("", "", "rolecodeflv", "RoleCode");
        this.showCfl("rolecodeflv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
      },

      onClosecflForCADNo: function () {
        let x = this.getCflObject();
      },

      cflForRoleName: async function () {
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0 ", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["Role Description"]);
        this.setCflDataColumns(["Description"]);
        this.setCflValueAndDisplay("", "", "rolenameflv", "Description");
        this.showCfl("rolenameflv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
      },

      onClosecflForCADNo: function () {
        let x = this.getCflObject();
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
    })
  }
);
