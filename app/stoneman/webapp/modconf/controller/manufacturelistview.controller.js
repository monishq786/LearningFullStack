sap.ui.define([
    "core/generic/genericlistview"
],
    function (genericlistview) {
        "use strict";

        return genericlistview.extend("modconfcontroller.manufacturelistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);

            },

            onBeforeShow: function (oEvent) {
                // this.validateAccess();
                this.initialize();
            },

            initialize: async function () {
                this.setPageId("manulv");
                this.setFormTitle("Manufacturing Operation List View");
                

                this.setListViewDataSourceProperties("GET", "/odata/v4/stoneman-crf/MManufacturing", "", "value");

                // cfl or input for manu code
                this.setListViewFilterColumn(
                    "manufacturename",
                    "Manufacture Name",
                    "Cfl",
                    "eq",
                    "String",
                    "ManufacturingName",
                    "cflForManufactureName"
                  );
                  this.setListViewFilterColumn(
                    "operationprocessname",
                    "Operation Process Name",
                    "Cfl",
                    "eq",
                    "String",
                    "OperationProcessName",
                    "cflForOperationName"
                  );
                  
                  this.setListViewDisplayColumns([
                      "Sr No.",
                      "Manufacture Code",
                      "Manufacture Name",
                      "Operation Code",
                      "Operation Name",
                      "Edit"
                    ]);
                    this.setListViewDataColumns([" ","ManufacturingCode", "ManufacturingName", "OperationProcessCode","OperationCode", "Edit"]);
                    this.setCflValueAndDisplay([" ","ManufactureCode", "ManufactureName", "OperationCode","OperationCode", "Edit"]);
                    this.setListViewEditProperty("ManufacturingGuid");
                    this.setForwardRoute("RouteNameManufactureentryform");
                    this.setBackwardRoute("RouteLanding");
                    this.showListView(this.getPageId());
                },

                cflForManufactureName:async function(){
                    await this.createNewModelUsingAPI("GET", "odata/v4/stoneman-crf/MManufacturing", "", this.getCflListViewDataSourceModelName());
                    this.setCflDisplayColumns(["Manufacturing Code", "Manufacturing Name"]);
                    this.setCflDataColumns(["ManufacturingCode", "ManufacturingName"]);
                    this.setCflValueAndDisplay("", "", "manufacturename", "ManufacturingName");
                    this.showCfl("manufacturename", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForManufactureName.bind(this));
            
                },

                cflForOperationName: async function(){
                    await this.createNewModelUsingAPI("GET", "odata/v4/stoneman-crf/MOperationProcess", "", this.getCflListViewDataSourceModelName());
                    this.setCflDisplayColumns(["Operation Process Code", "Operation Process Name"]);
                    this.setCflDataColumns(["OperationProcessCode", "OperationProcessName"]);
                    this.setCflValueAndDisplay("", "", "operationname", "OperationProcessName");
                    this.showCfl("operationprocessname", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForOperationName.bind(this));
            
                
                },

                onClosecflForManufactureName:function(){

                },

                onClosecflForOperationName:async function(){

                }
                
                
                
                
        })
    }
);