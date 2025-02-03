sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
   
], function (Controller, Fragment) {
    'use strict';
    var _oView
    var _title
    return Controller.extend("stoneman.controller.SeekAdviceQueryDialog", {
        constructor: function (oView, title, from) {
            this._oView = oView;
            this._title=title;
        },
        open: function () {
            var innerView = this._oView;
            var innerTitle = this._title;
            Fragment.load({
                id: innerView.getId(),
                name: 'stoneman.view.SeekAdviceQueryDialog',
                controller: this
            }).then(function(oDialog){
               innerView.addDependent(oDialog);
               oDialog.setTitle(innerTitle);
               oDialog.open();
            })
        },
        onCloseQueryDialog: function () {
            var innerView = this._oView;
            innerView.byId("queryDialog").close();
            innerView.byId("queryDialog").destroy();
            innerView=null;
            this._oView=null;
        }
    });

});