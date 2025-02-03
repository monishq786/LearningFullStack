sap.ui.define([
    "core/generic/genericlistview",

],

    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.enummasterlistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                //this.validateAccess();
                this.initialize();

            },

            initialize: async function () {
                this.setPageId("enumlv"); // XML page ID // page title
                this.setFormTitle("{i18n>EnumListViewTitle}");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MEnum", "", "value");
                this.setListViewDisplayColumns(["Enum Code", "Enum Description", "Enum Type", "Action"]);
                this.setListViewDataColumns(["EnumCode", "EnumDescription", "EnumType", "Edit"]);

                // this.setListViewFilterColumn("menulvMenu", "Menu Code", "Cfl", "eq", "String", "MenuCode", "cflForMenuCode");
                // this.setListViewFilterColumn("menulvName", "Menu Name", "Cfl", "eq", "String", "MenuName", "cflForMenuName");

                this.setListViewFilterColumn("enumlvenum", "Enum Code", "Cfl", "eq", "String", "EnumCode", "cflForEnumCode");
                //this.setListViewFilterColumn("menulvName", "Menu Name", "Cfl", "eq", "String", "Description", "cflForMenuName");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty("EnumGuid"); // TODO to be change based on requirments
                this.setForwardRoute("RouterNameenummasterentryform");
                this.setBackwardRoute("RouteLanding");

            },

            cflForEnumCode: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MEnum", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["EnumCode"]);
                this.setCflDataColumns(["EnumCode"]);
                this.setCflValueAndDisplay("", "", "enumlvenum", "EnumCode");
                this.showCfl("enumlvenum", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForMenu.bind(this));
            },

            onClosecflForMenu: function () {
                let x = this.getCflObject();
            },



        })
    }
);