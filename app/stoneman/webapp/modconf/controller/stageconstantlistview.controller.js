sap.ui.define([
    "core/generic/genericlistview",

],

    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.stageconstantlistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                //this.validateAccess();
                this.initialize();

            },

            initialize: async function () {
                this.setPageId("stgconlv"); // XML page ID // page title
                this.setFormTitle("Stage Constant List View");
                this.setFormSubTitle("");


                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MStageConstant", "", "value");
                this.setListViewDisplayColumns(["Stage Constant" ]);
                this.setListViewDataColumns(["StageConstant"]);

                this.setListViewFilterColumn("stageconslv", "Stage Constant", "Cfl", "eq", "String", "StageConstant", "cflForStageConstant");
                // this.setListViewFilterColumn("stagefllvName", "Current Stage Code", "Cfl", "eq", "String", "CurrentStageCode_StageCode_StageConstant", "cflForCurrentStageCode");
                await this.showListView(this.getPageId());
                this.setListViewEditProperty(""); // TODO to be change based on requirments
                this.setForwardRoute("RouterNamestageconstantentryform");
                this.setBackwardRoute("RouteLanding");


            },
            cflForStageConstant: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MStageConstant", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["StageConstant"]);
                this.setCflDataColumns(["StageConstant"]);
                this.setCflValueAndDisplay("", "", "stageconslv", "StageConstant");
                this.showCfl("stageconslv", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageConstant.bind(this));
            },
            onClosecflForStageConstant: function () {
                let x = this.getCflObject();
            },


            // cflForCurrentStageCode: async function () {
            //     await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MStageConstant", "", this.getCflListViewDataSourceModelName());
            //     this.setCflDisplayColumns(["StageConstant"]);
            //     this.setCflDataColumns(["StageConstant"]);
            //     this.setCflValueAndDisplay("", "", "stagefllvName", "StageConstant");
            //     this.showCfl("stagefllvName", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADNo.bind(this));
            // },


            // onClosecflForCADNo: function () {
            //     let x = this.getCflObject();
            // },
        })
    }
);