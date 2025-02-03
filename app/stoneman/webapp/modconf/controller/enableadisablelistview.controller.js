sap.ui.define([
    "core/generic/genericlistview"
],
    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.enableadisablelistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                // this.validateAccess();
                this.initialize(oEvent);
            },

            initialize: async function () {
                this.setPageId("enableadisablelv");
                this.setFormTitle("{i18n>enabledisablelvtitle}");
                this.setFormSubTitle('');

                this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MCrfControls', '', 'value');
                
                this.setListViewDisplayColumns(["RoleCode", "StageCode", "FormType", "Edit"]);
                this.setListViewDataColumns(["RoleCodeName", "StageCodeName", "FormType", "Edit"]);
                
                // filter
                this.setListViewFilterColumn('rolecodecfl', 'RoleCode', 'Cfl', 'eq', 'String', 'RoleCodeName', 'cflForRoleCode');
                this.setListViewFilterColumn('stagecodecfl', 'StageCode', 'Cfl', 'eq', 'String', 'StageCodeName', 'cflForStageCode');
                // this.setListViewFilterColumn("rolecodecfl", "Role Code", "cfl", "eq", "String", "RoleCode_RoleCode_RoleConstant", "forrolecodecfl");

                this.setListViewEditProperty("ControlsID");
                this.setForwardRoute("RouterNameControlEnableDisableentryform");
                this.setBackwardRoute("RouteLanding");
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

            cflForRoleCode:async function(){
                await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0', '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Role Code']);
                this.setCflDataColumns(['RoleCode']);
                this.setCflValueAndDisplay('', '', 'rolecodecfl', 'RoleCode');
                this.showCfl('rolecodecfl', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForRoleCode.bind(this));
    
            },

            onClosecflForRoleCode:function() {
                let x = this.getCflObject();
            },

            cflForStageCode:async function(){

                await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MStage?$filter=DelMark eq 0', '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['StageCode']);
                this.setCflDataColumns(['StageCode']);
                this.setCflValueAndDisplay('', '', 'stagecodecfl', 'StageCode');
                this.showCfl('stagecodecfl', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForStageCode.bind(this));
    
            },

            onClosecflForStageCode:function() {
                let x = this.getCflObject();
            }





        })
    }
);



