sap.ui.define([
    "core/generic/genericlistview",

],

    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.stageflowmasterlistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                //this.validateAccess();
                this.initialize();

            },

            initialize: async function () {
                this.setPageId("stageflowlv"); // XML page ID // page title
                this.setFormTitle("Stage Flow master List View");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MStageFlow", "", "value");
                this.setListViewDisplayColumns(["Form Type", "Current Stage Code", "Scenario", "action"]);
                this.setListViewDataColumns(["FormType", "CurrentStageCode_StageCode_StageConstant", "Scenario", "Edit"]);

                this.setListViewFilterColumn("stageflowlv", "Form Type", "Cfl", "eq", "String", "FormType", "cflForFormType");
                this.setListViewFilterColumn("stagefllvName", "Current Stage Code", "Cfl", "eq", "String", "CurrentStageCode_StageCode_StageConstant", "cflForCurrentStageCode");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty("StageFlowID"); // TODO to be change based on requirments
                this.setForwardRoute("RouterNamestageflowmasterentryform");
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


            cflForFormType: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MStageFlow", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["FormType"]);
                this.setCflDataColumns(["FormType"]);
                this.setCflValueAndDisplay("", "", "stageflowlv", "FormType");
                this.showCfl("stageflowlv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            },
            onClosecflForCADNo: function () {
                let x = this.getCflObject();
            },


            cflForCurrentStageCode: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MStageConstant", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["StageConstant"]);
                this.setCflDataColumns(["StageConstant"]);
                this.setCflValueAndDisplay("", "", "stagefllvName", "StageConstant");
                this.showCfl("stagefllvName", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            },


            onClosecflForCADNo: function () {
                let x = this.getCflObject();
            },
        })
    }
);