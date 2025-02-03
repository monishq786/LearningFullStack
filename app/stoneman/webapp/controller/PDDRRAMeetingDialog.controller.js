sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"  
   
], function (Controller, Fragment , JSONModel,MessageBox) {
    'use strict';
    var _oView
    var _title
    return Controller.extend("stoneman.controller.PDDRRAMeetingDialog", {
        constructor: function (oView, title, from) {
            this._oView = oView;
            this._title=title;
        },onInit: function() {

            var oPath=jQuery.sap.getModulePath(
                "stoneman",
                "/model/CADDetailForm.json"
            );
            var oModel=new sap.ui.model.json.JSONModel(oPath);
            
            this._oView.setModel(oModel,"cadRequestModel");
           
        },addUser: function (oEvent) {
            var oTable = this.byId("myTable7");
           var oModel= this._oView.getModel("cadRequestModel");
           var data=oModel.getData();
           var len=data.tabledata7.length;
        //    if(len>=5){
        //     MessageToast.show("Maximum of 5 rows can be added.");
        //     return;
        //    }
           data.tabledata7.push({"department":"Sampling","user":"","callmeeting":"Yes","meetingattended":"Yes","remarks":"","visible":true});
        
           oModel.setData(data);
          this._oView.setModel(oModel,"cadRequestModel");
        },
        open: function () {
            var innerView = this._oView;
            var innerTitle = this._title;
            Fragment.load({
                id: innerView.getId(),
                name: 'stoneman.view.PDDRRAMeetingDialog',
                controller: this
            }).then(function(oDialog){
                innerView.addDependent(oDialog);
                oDialog.open();
            })
        },
        onDeleteRowPress: function(oEvent){

            var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            
           // var oButton = oEvent.getSource();
           // var oRow = oButton.getParent().getParent(); // Assuming Button is placed inside ColumnListItem
          //  var sName = oRow.getCells()[0].getValue(); // Assuming Name is in the first cell
          var oModel = this._oView.getModel("cadRequestModel");
          var aData = oModel.getData();
            MessageBox.confirm("Are you sure you want to delete row" + "?", {
                title: "Confirm",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {

                       
            // Update the data for the clicked row
            aData.tabledata7.splice(iIndex,1);
            
            // Set the updated data back to the model
            oModel.setData(aData);
            this._oView.setModel(oModel,"cadRequestModel");     
                    } else {
                        // Cancelled deletion
                    }
                }
            
            });
            // Get the model
        
            

        },
        onCloseQueryDialog: function () {
            var innerView = this._oView;
            innerView.byId("meetingDialog").close();
            innerView.byId("meetingDialog").destroy();
        }
        
    });

});