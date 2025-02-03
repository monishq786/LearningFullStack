sap.ui.define([
  "core/generic/genericlistview",

],

  function (genericlistview) {
    "use strict";

    return genericlistview.extend("modconfcontroller.stagemasterlistview", {

      onInit: function () {
        genericlistview.prototype.onInit.apply(this, arguments);

      },

      onBeforeShow: function (oEvent) {
        //this.validateAccess();
        this.initialize();

      },

      initialize: async function () {
        this.setPageId("stagelv"); // XML page ID // page title
        this.setFormTitle("Stage master List View");
        this.setFormSubTitle("");


        this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MStage?$expand=Role($filter=DelMark eq 0),Role($expand=Role)&$filter=DelMark eq 0", "", "value");
        this.setListViewDisplayColumns(["Stage Code", "Stage Description", "action"]);
        this.setListViewDataColumns(["StageCode", "Description", "Edit"]);

        this.setListViewFilterColumn("stglvStageCode", "Stage Code", "Cfl", "eq", "String", "StageCode", "cflForStageCode");
        this.setListViewFilterColumn("stglvStageDesc", "Stage Description", "Cfl", "eq", "String", "Description", "cflForStageDesc");
        await this.showListView(this.getPageId());
        this.setListViewEditProperty("StageGuid"); // TODO to be change based on requirments
        this.setForwardRoute("RouterNamestagemasterentryform");
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

      cflForStageCode: async function () {
        this.setCflTitle('Stage Code List');
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'STAGECODE'", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["Stage Code"]);
        this.setCflDataColumns(["EnumCode"]);
        this.setCflValueAndDisplay("", "", "stglvStageCode", "EnumCode");
        this.showCfl("stglvStageCode", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStage.bind(this));
      },
      onClosecflForStage: function () {
        let x = this.getCflObject();
      },


      cflForStageDesc: async function () {
        this.setCflTitle('Stage Description List');
        await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'STAGECODE'", "", this.getCflListViewDataSourceModelName());
        this.setCflDisplayColumns(["Stage Description"]);
        this.setCflDataColumns(["EnumDescription"]);
        this.setCflValueAndDisplay("", "", "stglvStageDesc", "EnumDescription");
        this.showCfl("stglvStageDesc", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
      },


      onClosecflForCADNo: function () {
        let x = this.getCflObject();
      },
    })
  }
);