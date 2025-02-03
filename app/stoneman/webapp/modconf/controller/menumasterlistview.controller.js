sap.ui.define([
  "core/generic/genericlistview",

],

  function (genericlistview) {
    "use strict";

    return genericlistview.extend("modconfcontroller.menumasterlistview", {

      onInit: function () {
        genericlistview.prototype.onInit.apply(this, arguments);

      },

      onBeforeShow: function (oEvent) {
        //this.validateAccess();
        this.initialize();

      },

      initialize: async function () {
        this.setPageId("menulv"); // XML page ID // page title
        this.setFormTitle("Menu master List View");
        this.setFormSubTitle("");


        this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0", "", "value");
        this.setListViewDisplayColumns(["Menu Code", "Menu Name", "Parent Menu Code", "Menu Icon", "action"]);
        this.setListViewDataColumns(["MenuCode", "Description", "ParentMenuCode",
          new sap.ui.core.Icon({
            //src: "sap-icon://filter",
            color: sap.ui.core.IconColor.Default,
            activeColor: sap.ui.core.IconColor.Positive,
            src: "{" + this.getListViewDataSourceModelName() + '>MenuIcon' + "}"
          }), "Edit"]);

        this.setListViewFilterColumn("menulvMenu", "Menu Code", "Cfl", "eq", "String", "MenuCode", "cflForMenuCode");
        this.setListViewFilterColumn("menulvName", "Menu Name", "Cfl", "eq", "String", "Description", "cflForMenuName");
        await this.showListView(this.getPageId());
        this.setListViewEditProperty("MenuGuid"); // TODO to be change based on requirments
        this.setForwardRoute("RouterNamemenumasterentryform");
        this.setBackwardRoute("RouteLanding");
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

      cflForMenuCode: async function () {
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["MenuCode"]);
        this.setCflDataColumns(["MenuCode"]);
        this.setCflValueAndDisplay("", "", "menulvMenu", "MenuCode");
        this.showCfl("menulvMenu", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
      },

      onClosecflForCADNo: function () {
        let x = this.getCflObject();
      },

      cflForMenuName: async function () {
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["MenuName"]);
        this.setCflDataColumns(["Description"]);
        this.setCflValueAndDisplay("", "", "menulvName", "Description");
        this.showCfl("menulvName", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
      },

      onClosecflForCADNo: function () {
        let x = this.getCflObject();
      },
    })
  }
);