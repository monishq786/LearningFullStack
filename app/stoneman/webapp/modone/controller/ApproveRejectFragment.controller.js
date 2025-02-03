sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",

], function (Controller, Fragment, MessageToast) {
    'use strict';
    let _oView
    let _title
    let _mainController;
    let _oSelectedRowContext;
    let _oSelectedData;
    let statusValue
    // changes for proper binding
    return Controller.extend("modonecontroller.ApproveRejectFragment", {
        constructor: function (oView, title, statusFlag, controller, modelData) {
            this._oView = oView;
            this._title = title;
            this.statusValue = statusFlag;
            this._oSelectedRowContext = null;
            this._mainController = controller;
            this._modelData = modelData;
        },

        open: function () {
            var innerView = this._oView;
            var innerTitle = this._title;
            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: innerView.getId(),
                    name: 'stoneman.modone.view.ApproveRejectFragment',
                    controller: this
                }).then(function (oDialog) {
                    innerView.addDependent(oDialog);
                    oDialog.setTitle(innerTitle);
                    return oDialog;
                })
            }
            this._pDialog.then(function (oDialog) {
                // Bind the fragment fields with the selected data
                var oDialogModel = new sap.ui.model.json.JSONModel(this._modelData);
                oDialog.setModel(oDialogModel, "dialogData");
                oDialog.open();
            }.bind(this));

        },
        onSendDialog: function () {
            var innerView = this._oView;
            var approveRejectVal = {
                Comment: '',
                Status: ''
            };
            var oDialog = this.byId("approvalDialog");
            var sValue = innerView.byId("commentInput").getValue();
            approveRejectVal.Comment = sValue;
            approveRejectVal.Status = this.statusValue;
            if ((sValue == "" || sValue == null) && (this.statusValue === 'REJECTED')) {
                MessageToast.show("Please enter Rejected reason");
                return;
            }
            this._mainController.getApproveRejectComment(approveRejectVal);
            innerView.byId("approvalDialog").close();
            innerView.byId("approvalDialog").destroy();
            innerView = null;
        },
        onCloseDialog: function () {
            var innerView = this._oView;
            var oDialog = innerView.byId("approvalDialog");

            if (oDialog) {
                oDialog.close(); // Close the dialog
                oDialog.attachAfterClose(function () {
                    oDialog.destroy(); // Destroy the dialog after it's closed
                });
            }
        }
    });

});