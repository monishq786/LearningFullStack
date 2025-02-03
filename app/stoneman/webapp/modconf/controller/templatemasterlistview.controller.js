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
                this.setPageId("pgtemplatelv"); // XML page ID // page title
                this.setFormTitle("Template Master List View");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/DTemplate?$filter=DelMark eq 0", "", "value");
                this.setListViewDisplayColumns([  "Template Name","Template Description","Start Date", " End Date", "Status","action"]);
                this.setListViewDataColumns(["TemplateName","Description",new sap.m.Text({
                    text: { path: this.getListViewDataSourceModelName() + '>ActiveStartDate', formatter: this.returnReverceDateFormat }
                  }),new sap.m.Text({
                    text: { path: this.getListViewDataSourceModelName() + '>ActiveEndDate', formatter: this.returnReverceDateFormat }
                  }),
                    // new sap.ui.core.Icon({
                    //     //src: "sap-icon://filter",
                    //     color: sap.ui.core.IconColor.Default,
                    //     activeColor: sap.ui.core.IconColor.Positive,
                    //     src: "{" + this.getListViewDataSourceModelName() + '>MenuIcon' + "}"
                    // }),
                    new sap.m.Text({
                        text: { path: this.getListViewDataSourceModelName() + '>IsActive', formatter: this.getIsActiveStatusAsActiveInActive }
                      }),"Edit"]);

                
                this.setListViewFilterColumn("menulvMenu", "Template Name", "Cfl", "eq", "String", "TemplateName", "cflForMenuCode");
                this.setListViewFilterColumn("menulvName", "Template Description", "Cfl", "eq", "String", "Description", "cflForMenuName");
                this.setListViewFilterColumn("StartDate", "Start Date", "DatePicker", "eq", "String", "ActiveStartDate", "");
                this.setListViewFilterColumn("EndDate", "End Date", "DatePicker", "eq", "String", "ActiveEndDate", "");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty("TemplateGuid"); // TODO to be change based on requirments
                this.setForwardRoute("RouterNameTemplatemasterentryform");
                this.setBackwardRoute("RouteLanding");
                await this.pageValidatations();

            },
            getIsActiveStatusAsActiveInActive: function (Status) {
                if (Status === 'Y') {
                    return "Yes";
                } else if (Status === 'N') {
                    return "No";
                } else {
                    return "Invalid status"; 
                }
            },
            returnReverceDateFormat: function (sDate) {
                const sDate1 = new Date(sDate);
                const formattedDate = new Intl.DateTimeFormat('en-GB').format(sDate1).replace(/\//g, '-');
                return formattedDate
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
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/DTemplate?$filter=DelMark eq 0", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["Template Name"]);
                this.setCflDataColumns(["TemplateName"]);
                this.setCflValueAndDisplay("", "", "menulvMenu", "TemplateName");
                this.showCfl("menulvMenu", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            },

            onClosecflForCADNo: function () {
                let x = this.getCflObject();
            },

            cflForMenuName: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/DTemplate?$filter=DelMark eq 0", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["Template Description"]);
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