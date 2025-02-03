sap.ui.define(
  ["sap/ui/core/mvc/Controller",
    
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Core",
    "sap/ui/core/Fragment",
    "../service/WebService",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    'sap/ui/core/format/DateFormat',
  ],
  function (Controller, JSONModel, Core, Fragment, WebService, Filter, FilterOperator, formatter, DateFormat) {
    "use strict";

    var objGlobalThis;
    var isVisible;
    var filteredData;
    var oDataCFL;
    return Controller.extend("stoneman.controller.CFLDialog", {
      constructor: function (oView, title, from, data) {
        objGlobalThis = this;
        this._oView = oView;
        this._Title = title;
        this._From = from;
        this.oDataCFL = data;
        // objGlobalThis.callAPI();
      },
      onInit: function () {

      },
      callAPI: function () {
        var oView = this._oView;
        var obji18n = oView.getModel("i18n").getResourceBundle();

        if (objGlobalThis._Title == obji18n.getText("PROJECTTEMPLATE")) {//Project Template
          // var data;
          // if (this._From == 'addedit') {
          //   var oModel = oView.getModel('templateModel');
          //   data = oModel.getData();
          // } else {//search
          //   var oModel = oView.getModel('projectTemplateListModel');
          //   data = oModel.getData();
          // }
          // //var oModel = oView.getModel('templateModel');//projectTemplateListModel

          // var renewArr = new Array();
          // for (let index = 0; index < data['results'].length; index++) {
          //   const element = data['results'][index];
          //   var dict = {
          //     "CODE": element['Project'],
          //     "NAME": element['ProjectDescription'],
          //     "FIELD1": element['YY1_Category1_PPH'],
          //     "FIELD2": element['YY1_NoofDays_PPH'],
          //     "FIELD3": ''
          //   }
          //   renewArr.push(dict);
          // }
          // var dict = {
          //   "title1": 'PROJECT TEMPLATE CODE',
          //   "title2": 'PROJECT TEMPLATE DESCRIPTION',
          //   "title3": 'CATEGORY',
          //   "title4": 'NO OF DAYS',
          //   "title5": '',
          //   "list": renewArr
          // }
          // var oDataModel = new sap.ui.model.json.JSONModel(dict);
          // oView.setModel(oDataModel, "DataModel");

        } else if (objGlobalThis._Title == obji18n.getText("SALESORDER")) {//Sales Order
          // var oModel = oView.getModel('salesOrderListModel');
          // var data = oModel.getData();
          // var renewArr = new Array();
          // for (let index = 0; index < data['results'].length; index++) {
          //   const element = data['results'][index];
          //   //sales order date
          //   var strSOStartDate = element['SalesOrderDate'];
          //   var numSOStartDate = strSOStartDate != null ? parseInt(strSOStartDate.replace(/[^0-9]/g, "")) : null;
          //   var dtSOStartDate = numSOStartDate != null ? new Date(numSOStartDate) : null;
          //   //so delivery date
          //   var strSODelvDate = element['RequestedDeliveryDate'];//"/Date(1268524800000)/";
          //   var numSODelvDate = strSODelvDate != null ? parseInt(strSODelvDate.replace(/[^0-9]/g, "")) : null;
          //   var dtSODelvDate = numSODelvDate != null ? new Date(numSODelvDate) : null;
          //   var dict = {
          //     "CODE": element['SalesOrder'],
          //     "NAME": element['SoldToParty'],
          //     "FIELD1": '',
          //     "FIELD2": dtSOStartDate != null ? formatter.getDateFromatIn_ddMMyyyy(dtSOStartDate) : '',
          //     "FIELD3": dtSODelvDate != null ? formatter.getDateFromatIn_ddMMyyyy(dtSODelvDate) : ''
          //   }
          //   renewArr.push(dict);
          // }
          // var dict = {
          //   "title1": 'SO No.',
          //   "title2": 'BP CODE',
          //   "title3": 'BP NAME',
          //   "title4": 'SALES ORDER DATE',
          //   "title5": 'SO DELIVERY DATE',
          //   "list": renewArr
          // }
          // var oDataModel = new sap.ui.model.json.JSONModel(dict);
          // oView.setModel(oDataModel, "DataModel");
          // oDataModel.refresh(true);
        } else if (objGlobalThis._Title == obji18n.getText("SALESORDERITEM")) {//Sales order Line Item
          // var oModel = oView.getModel('salesOrderLineItemListModel');
          // var data = oModel.getData();
          // var renewArr = new Array();
          // for (let index = 0; index < data['to_Item']['results'].length; index++) {
          //   const element = data['to_Item']['results'][index];
          //   var dict = {
          //     "CODE": element['SalesOrderItem'],
          //     "NAME": element['SalesOrderItemText'],
          //     "FIELD1": element['SalesOrder'],
          //     "FIELD2": element['AdditionalMaterialGroup1'],
          //     "FIELD3": ''
          //   }
          //   renewArr.push(dict);
          // }
          // var dict = {
          //   "title1": 'SO LINE ITEM No.',
          //   "title2": 'SO LINE ITEM NAME',
          //   "title3": 'SO No.',
          //   "title4": 'CATEGORY',
          //   "title5": '',
          //   "list": renewArr
          // }
          // var oDataModel = new sap.ui.model.json.JSONModel(dict);
          // oView.setModel(oDataModel, "DataModel");
        }
      },
      open: function () {
        var oView = this._oView;
        var Title = this._Title;

        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.CFLDialog",
          controller: this,
          //autoPrefixId: false,
        }).then(function (oDialog) {
          //var tbl = oView.byId("table");
          // objGlobalThis.bindTableDynamic(tbl,oDialog);

          oView.addDependent(oDialog);
          oDialog.setTitle(Title);
          oDialog.open();
        });
      },
      exit: function () {
        delete oView.getId();
        delete this._oView;
        oDialog.destroy();
      },
      handleRowClick: function (oEvent) {
        var oView = this._oView;

        var itemContextPath = oEvent
          .getParameter("listItem")
          .getBindingContextPath();

        var rowIndex = parseInt(
          itemContextPath.substring(
            itemContextPath.lastIndexOf("/") + 1,
            itemContextPath.length
          )
        );

        var oView = this._oView;
        var obji18n = oView.getModel("i18n").getResourceBundle();
        if (objGlobalThis._Title == obji18n.getText("PROJECTTEMPLATE")) {
          var aData;
          if (this._From == 'addedit') {
            var oModel = oView.getModel('templateModel');
            aData = oModel.getData();
          } else {//search
            var oModel = oView.getModel('projectTemplateListModel');
            aData = oModel.getData();
          }
         // var oModel = oView.getModel("projectTemplateListModel");
         // var aData = oModel.getData();
          var selectedObj = aData['results'][rowIndex];
          if (this._From == 'addedit') {
            sap.ui.getCore().getEventBus().publish("ProjectTempDialogAddEdit", "rowSelectEvent", selectedObj);
          } else {
            sap.ui.getCore().getEventBus().publish("ProjectTempDialogSearch", "rowSelectEvent", selectedObj);
          }
        } else if (objGlobalThis._Title == obji18n.getText("SALESORDER")) {
          var oModel = oView.getModel("salesOrderListModel");
          var aData = oModel.getData();
          var selectedObj = aData['results'][rowIndex];
          if (this._From == 'addedit') {
            sap.ui.getCore().getEventBus().publish("SalesOrderDialogAddEdit", "rowSelectEvent", selectedObj);
          } else {
            sap.ui.getCore().getEventBus().publish("SalesOrderDialogSearch", "rowSelectEvent", selectedObj);
          }
        } else if (objGlobalThis._Title == obji18n.getText("SALESORDERITEM")) {
          //var oModel = oView.getModel("TempModel");
          //var aData = oModel.getData();
          var oModel = oView.getModel("salesOrderLineItemListModel");
          var aData = oModel.getData();
          var selectedObj = aData['to_Item']['results'][rowIndex];
          if (this._From == 'addedit') {
            sap.ui.getCore().getEventBus().publish("SalesOrderLineItemDialogAddEdit", "rowSelectEvent", selectedObj);
          } else {
            sap.ui.getCore().getEventBus().publish("SalesOrderLineItemDialogSearch", "rowSelectEvent", selectedObj);
          }
        }

        oView.byId("Dialog").close();
      },
      handleCFLClose: function (oEvent) {
        var oView = this._oView;
        oView.byId("Dialog").close();
      },
      onAfterClose: function (oEvent) {
        console.log("dialog closed");
        oEvent.getSource().destroy();
      },
      onFilterPosts: function (oEvent) {
        // var sValue = oEvent.getParameter("query");
        // var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
        // var oBinding = oEvent.getSource().getBinding("items");
        // oBinding.filter([oFilter]);

        var sQuery = oEvent.getParameter("query");
        this._oGlobalFilter = null;

        if (sQuery) {
          this._oGlobalFilter = new Filter([
            new Filter("CODE", FilterOperator.Contains, sQuery),
            new Filter("NAME", FilterOperator.Contains, sQuery)
          ], false);
        }

        this._filter();
      },

      _filter: function () {
        var oFilter = null;

        /*if (this._oGlobalFilter) {
          oFilter = new Filter([this._oGlobalFilter], true);
        } else */
        if (this._oGlobalFilter) {
          oFilter = this._oGlobalFilter;
        }

        var oView = this._oView;
        oView.byId("table").getBinding("items").filter(oFilter, "Application");
      },

      bindTableDynamic: function (tbl, oDialog) {
        var oView = this._oView;

        var oMetaModel = new sap.ui.model.json.JSONModel({
          headers: ["Template No", "Template Name", "Template Description"]
        });

        var oModel = oView.getModel("TempModel");
        var data = oModel.getData();

        var renewArr = new Array();
        for (let index = 0; index < data['templateList'].length; index++) {
          const element = data['templateList'][index];
          var dict = {
            "Template No": element['tah_prjtemplno'],
            "Template Name": element['tah_prjtemplnme'],
            "Template Description": element['tah_prjtempdesc']
          }
          renewArr.push(dict);
        }

        var dict = {
          "templateList": renewArr
        }
        var oDataModel = new sap.ui.model.json.JSONModel(dict);

        /*var oDataModel = new sap.ui.model.json.JSONModel({
          products: [{
            "Product Name": "TV",
            "Product ID": "TV1",
            "Price": "$100"
          }, {
            "Product Name": "Computer",
            "Product ID": "TP1",
            "Price": "$500"
          }, {
            "Product Name": "Car",
            "Product ID": "CR1",
            "Price": "$10,000"
          }]
        });*/

        oView.setModel(oMetaModel, "MetaModel");
        oView.setModel(oDataModel, "DataModel");

        var oTable = oView.byId("table");
        oTable.setModel(oDataModel);

        oTable.bindColumns("MetaModel>/headers", function (sId, oContext) {
          var sLabel = oContext.getObject();
          return new sap.ui.table.Column({
            label: new sap.m.Label({
              text: sLabel
            }),
            template: "DataModel>" + sLabel
          });
        });

        oTable.bindItems("DataModel>/templateList");
        tbl.bindRows("DataModel>/templateList");


      }
    })
  })