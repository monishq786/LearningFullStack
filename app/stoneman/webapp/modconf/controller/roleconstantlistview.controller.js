sap.ui.define([
    "core/generic/genericlistview",

],

    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.roleconstantlistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                //this.validateAccess();
                this.initialize();

            },

            initialize: async function () {
                this.setPageId("roleconstantlv"); // XML page ID // page title
                this.setFormTitle("{i18n>RoleConstantListViewTitle}");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MRoleConstant", "", "value");
                this.setListViewDisplayColumns(["RoleConstant", "IsActive", "Action"]);
                this.setListViewDataColumns(["RoleConstant", "IsActive", "Edit"]);

                // this.setListViewFilterColumn("menulvMenu", "Menu Code", "Cfl", "eq", "String", "MenuCode", "cflForMenuCode");
                // this.setListViewFilterColumn("menulvName", "Menu Name", "Cfl", "eq", "String", "MenuName", "cflForMenuName");

                 this.setListViewFilterColumn("rolenameflv", "Role Name", "Cfl", "eq", "String", "RoleName", "cflForRoleCode");
                this.setListViewFilterColumn("roleconstantflv", "RoleConstant", "Input", "eq", "String", "RoleConstant", "");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty("RoleConstant"); // TODO to be change based on requirments
                this.setForwardRoute("RouterNameRoleConstantentryform");
                this.setBackwardRoute("RouteLanding");



               
    


            }

            
        })
    }
);