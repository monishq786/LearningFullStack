sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
],
	function (Controller, JSONModel) {
		"use strict";
		return Controller.extend("modonecontroller.Page", {
			onInit: function () {
				var sPath = sap.ui.require.toUrl("modone/model/items.json"),
					oUploadSet = this.byId("UploadSet");

				this.getView().setModel(new JSONModel(sPath));

				// Modify "add file" button
				oUploadSet.getDefaultFileUploader().setButtonOnly(false);
				oUploadSet.getDefaultFileUploader().setTooltip("");
				oUploadSet.getDefaultFileUploader().setIconOnly(true);
				oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");
				oUploadSet.attachUploadCompleted(this.onUploadCompleted.bind(this));
			},
			onDownloadSelectedButton: function () {
				var oUploadSet = this.byId("UploadSet");

				oUploadSet.getItems().forEach(function (oItem) {
					if (oItem.getListItem().getSelected()) {
						oItem.download(true);
					}
				});
			},

			onUploadCompleted: function (oEvent) {
				this.oItemToUpdate = null;
				//this.byId("versionButton").setEnabled(false);
				// add item to the model
				var oItem = oEvent.getParameter("item");
				var oModel = this.getView().getModel();
				var aItems = oModel.getProperty("/items");
				var oItemData = this._getItemData(oItem);
				aItems.unshift(oItemData);
				oModel.setProperty("/items", aItems);
				oModel.refresh();
			},

			onAfterItemRemoved: function (oEvent) {
				// remove item from the model
				var oItem = oEvent.getParameter("item");
				var oModel = this.getView().getModel();
				var aItems = oModel.getProperty("/items");
				var oItemData = oItem?.getBindingContext()?.getObject();
				var iIndex = aItems.findIndex((item) => {
					return item.id == oItemData?.id;
				});
				if (iIndex > -1) {
					aItems.splice(iIndex, 1);
					oModel.setProperty("/items", aItems);
				}
			},

			_getItemData: function (oItem) {
				// generate a 6 digit random number as id
				const iId = Math.floor(Math.random() * 1000000);
				const oFileObject = oItem.getFileObject();
				return {
					id: iId,
					fileName: oItem?.getFileName(),
					uploaded: new Date(),
					uploadedBy: "John Doe",
					mediaType: oFileObject.type,
					// URL to the uploaded file from blob.
					url: oItem?.getUrl() ? oItem?.getUrl() : URL.createObjectURL(oFileObject),
					statuses: [
						{
							"title": "Uploaded By",
							"text": "Jane Burns",
							"active": true
						},
						{
							"title": "Uploaded On",
							"text": "Today",
							"active": false
						}
					]
				};
			},
			onSelectAll: function (oEvent) {
				// Get the UploadSet control
				var oUploadSet = this.byId("UploadSet");
				var bSelected = oEvent.getParameter("selected"); // Check if the checkbox is selected

				// Get all items in the UploadSet
				var aItems = oUploadSet.getItems();

				// Select or deselect all items
				aItems.forEach(function (oItem) {
					oItem.setSelected(bSelected);
				});
			},
			onDeleteSelectedButton: function () {
				var oUploadSet = this.byId("UploadSet");
				var aItems = oUploadSet.getItems();
				var aSelectedItems = aItems.filter(function (oItem) {
					return oItem.getSelected();
				});
	
				if (aSelectedItems.length === 0) {
					MessageToast.show("No files selected for deletion.");
					return;
				}
	
				// Remove selected items from the UploadSet
				aSelectedItems.forEach(function (oItem) {
					oUploadSet.removeItem(oItem);
				});
	
			},
		});
	});