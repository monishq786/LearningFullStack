sap.ui.define([
    "core/generic/genericlistview",
], function (genericlistview) {
    'use strict';

    return genericlistview.extend("modonecontroller.datalist", {
        onInit: function () {
            genericlistview.prototype.onInit.apply(this, arguments);
        },

        onBeforeShow: function (oEvent) {
            //this.validateAccess();

            this.initialize();
        },

        initialize: async function () {
            this.setPageId('stagerolelv');
            this.setFormTitle('Stage Role Master');
            this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MStageRole', '', 'value');
            this.setListViewDisplayColumns(['Role Code', 'Stage Code', 'Validation Code', 'Active', 'Edit']);

            this.setListViewDataColumns(['RoleCode_RoleCode_RoleConstant', 'StageCode_StageCode_StageConstant', 'ValidationCode', 'IsActive', 'Edit',
                new sap.ui.core.Icon({
                    //src: "sap-icon://filter",
                    color: sap.ui.core.IconColor.Default,
                    activeColor: sap.ui.core.IconColor.Positive,
                    src: "{" + this.getListViewDataSourceModelName() + '>MenuIcon' + "}"
                }), "Edit"]);
            this.setListViewFilterColumn("rolecodelv", "Role Code", "Cfl", "eq", "String", "RoleCode_RoleCode_RoleConstant", "cflForRoleCode");
            this.setListViewFilterColumn("stagecodelv", "stage Code", "Cfl", "eq", "String", "StageCode_StageCode_StageConstant", "cflForStageCode");
            this.setListViewFilterColumn("validationcodelv", "Validation Code", "Cfl", "eq", "String", "ValidationCode", "cflForValidationCode");
            await this.showListView(this.getPageId());
            this.setListViewEditProperty('StageRoleID');
            this.setForwardRoute("RouteNameStageRoleMasterentryform");
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
        
        cflForRoleCode: async function () {
            let Ourl = '/odata/v4/stoneman-crf/MRole';

            await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Role Code']);
            this.setCflDataColumns(['RoleCode_RoleConstant']);
            this.setCflValueAndDisplay("", "", "rolecodelv", "RoleCode_RoleConstant");
            this.showCfl("rolecodelv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForRoleCode.bind(this));
        },

        cflForStageCode: async function () {
            let Ourl = '/odata/v4/stoneman-crf/MStage';

            await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Stage Code']);
            this.setCflDataColumns(['StageCode_StageConstant']);
            this.setCflValueAndDisplay("", "", "stagecodelv", "StageCode_StageConstant");
            this.showCfl("stagecodelv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageCode.bind(this));
        },

        cflForValidationCode: async function () {
            let Ourl = '/odata/v4/stoneman-crf/MStageRole';

            await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Validation Code']);
            this.setCflDataColumns(['ValidationCode']);
            this.setCflValueAndDisplay("", "", "validationcodelv", "ValidationCode");
            this.showCfl("validationcodelv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForValidationCode.bind(this));
        },

        onClosecflForRoleCode: function () {
            let x = this.getCflObject();
        },

        onClosecflForStageCode: function () {
            let x = this.getCflObject();
        },

        onClosecflForValidationCode: function () {
            let x = this.getCflObject();
        },


        selectForStatus: function () {

        },



    });
});