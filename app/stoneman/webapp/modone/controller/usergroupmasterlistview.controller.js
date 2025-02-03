sap.ui.define([
    "core/generic/genericlistview"
],

    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modonecontroller.usergroupmasterlistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                //this.validateAccess();
                this.initialize();

            },

            initialize: async function () {
                this.setPageId("usergrplv"); // XML page ID // page title
                this.setFormTitle("User Group Master List View");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MUserGroup", "", "value");
                this.setListViewDisplayColumns(["User Group Name", "Active", "action"]);
                this.setListViewDataColumns(["UserGroupName", "", "Edit"]);

                this.setListViewFilterColumn("usergrplvMenu", "User Group Name", "Cfl", "eq", "String", "UserGroupName", "cflForUserGroupName");
                //this.setListViewFilterColumn("menulvName", "Menu Name", "Cfl", "eq", "String", "MenuName", "cflForMenuName");
                // this.setListViewFilterColumn("coplvDescription", "Description", "Cfl", "eq", "String", "ITEMDES", "cflForDescription");
                // this.setListViewFilterColumn("coplvBuyerName", "Buyer Name", "Cfl", "eq", "String", "BUYERNAME", "cflForBuyerName");
                // this.setListViewFilterColumn("coplvCategory", "Category", "Cfl", "eq", "String", "FormStatus", "cflForCategory");
                // this.setListViewFilterColumn("coplvSubCategory", "Sub Category", "Cfl", "eq", "String", "FormStatus", "cflForSubCategory");
                // this.setListViewFilterColumn("coplvRawMaterial", "Raw Material", "Cfl", "eq", "String", "RAWMATERIAL", "cflForRawMaterial");

                // this.setListViewEditProperty("COSTINGHEADERUUID"); // TODO to be change based on requirments
                // this.setForwardRoute("RouterNameCOPEntryForm");
                // this.setBackwardRoute("RouteLanding");
                // this.setFormSubTitle("");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty("UserGroupId"); // TODO to be change based on requirments
                this.setForwardRoute("RouterNamemenumasterentryform");
                this.setBackwardRoute("RouteLanding");


            },
            cflForUserGroupName: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MUserGroup", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["UserGroupName"]);
                this.setCflDataColumns(["UserGroupName"]);
                this.setCflValueAndDisplay("", "", "usergrplvMenu", "UserGroupName");
                this.showCfl("usergrplvMenu", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            },
            onClosecflForCADNo: function () {
                let x = this.getCflObject();
            },


            // cflForMenuName: async function () {
            //     await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MMenu", "", this.getCflListViewDataSourceModelName());
            //     this.setCflDisplayColumns(["MenuName"]);
            //     this.setCflDataColumns(["MenuName"]);
            //     this.setCflValueAndDisplay("", "", "menulvName", "MenuName");
            //     this.showCfl("menulvName", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            // },


            // onClosecflForCADNo: function () {
            //     let x = this.getCflObject();
            // },
        })
    }
);