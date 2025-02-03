sap.ui.define([
	'sap/m/MessageToast',
	'sap/ui/core/mvc/Controller',
	"sap/ui/model/json/JSONModel"],
	function (MessageToast, Controller,JSONModel) {
		"use strict";

		return Controller.extend("stoneman.controller.tryOut", {
			onInit: function () {
				var oPath = jQuery.sap.getModulePath(
					"stoneman",
					"/model/products.json",

				);
				var oModel = new sap.ui.model.json.JSONModel(oPath);
				this.getView().setModel(oModel, "ProductModel");
			},

			addRow: function () {

				var oModel = this.getView().getModel("ProductModel");

				var data = oModel.getData();
				var rowLen = data.ProductCollection.length;
				if (rowLen >= 5) {
				  MessageToast.show("Maximum of 5 rows can be added.");
				  return;
				}
				data.ProductCollection.push({ SupplierName:'Ultrasonic United',ProductId: '1', Name: '12', Width: '13', Depth: '23', Height: '11', DimUnit: '10' })
				oModel.setData(data);
				this.getView().setModel(oModel, "ProductModel");
			},
			onDeleteRow: function (oEvent) {
				var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
				var oModel = this.getView().getModel("ProductModel");
				var aData = oModel.getData();
				sap.m.MessageBox.show("Are you sure you want to delete record?", {
				  title: "Confirm",
				  actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				  onClose: function (oAction) {
					if (oAction == "YES") {
					  aData.ProductCollection.splice(iIndex, 1);
					  oModel.setData(aData);
					}
		
				  }
				})
		
			  },
		});

	});
