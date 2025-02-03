sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
   
], function (Controller, Fragment,MessageToast) {
    'use strict';
    var _oView
    var _title
var _mainController;
var _oSelectedRowContext ;
        var _oSelectedData; 
        // changes for proper binding
    return Controller.extend("stoneman.controller.SeekAdviceCommentDialog", {
        constructor: function (oView, title, from,controller) {
            this._oView = oView;
            this._title=title;
            this._oSelectedRowContext = null; 
            this._mainController = controller;
        },
        open: function (oSelectedRowContext, oSelectedData) {
            this._oSelectedRowContext = oSelectedRowContext;
            this._oSelectedData = oSelectedData;
            this._oSelectedRowContext = oSelectedRowContext;
            var innerView = this._oView;
            var innerTitle = this._title;
            if (!this._pDialog) {
                this._pDialog =   Fragment.load({
                id: innerView.getId(),
                name: 'stoneman.view.SeekAdviceCommentDialog',
                controller: this
            }).then(function(oDialog){
               innerView.addDependent(oDialog);
               oDialog.setTitle(innerTitle);
               return oDialog;
            })
        }
        this._pDialog.then(function (oDialog) {
            // Bind the fragment fields with the selected data
            var oDialogModel = new sap.ui.model.json.JSONModel(this._oSelectedData);
            oDialog.setModel(oDialogModel, "dialogData");
            oDialog.open();
        }.bind(this));

        },
        onSendDialog: function () {
            var innerView = this._oView;
            var oDialog = this.byId("commentDialog");
      //var sValue = oDialog.getContent()[0].getItems()[0].getItems()[0].getValue(); // Adjust based on your fragment structure
      //var sValue = that.getView().getModel().getProperty("/replyValue");
      var sValue =innerView.byId("replyDialog").getValue();
      if(sValue=="" || sValue==null)
        {
            MessageToast.show("Please enter reply.");
            return;
        }
      // Update the model for the selected row context
     // var oModel= this.getView().getModel("cadRequestModel");
    //  var oModel = sap.ui.getCore().byId("CADRequestForm").getModel("cadRequestModel");
      //var oModel= this.getOwnerComponent().getAggregation("rootControl").getController().getModel("cadRequestModel");
    //  oModel.setProperty(this._oSelectedRowContext.getPath() + "/comment", sValue);
    //   var oEventBus = this.getOwnerComponent().getEventBus();
    //   oEventBus.publish("web", "callMainControllerMethod", {
    //     selectedItem: sValue
    //   });
      this._mainController.handleFragmentSelection(sValue);
      
            innerView.byId("commentDialog").close();
            innerView.byId("commentDialog").destroy();
            innerView=null;
        },
        onCloseDialog: function () {
            var innerView = this._oView;
            innerView.byId("commentDialog").close();
            innerView.byId("commentDialog").destroy();
            innerView=null;
        }
    });

});