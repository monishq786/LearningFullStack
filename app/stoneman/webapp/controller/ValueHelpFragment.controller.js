sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], function (Controller, Fragment) {
    'use strict';
    var _oView;
    var _title;
    return Controller.extend("stoneman.controller.ValueHelpFragment", {
        constructor: function (oView, title, from) {
            this._oView = oView;
            this._title = title;
        },
        
        open: function () {
            var innerView = this._oView;
            var innerTitle = this._title;
            Fragment.load({
                id: innerView.getId(),
                name: "stoneman.view.ValueHelpFragment",
                controller: this
            }).then(function (oDialog) {
                innerView.addDependent(oDialog);
                oDialog.open();
            });

        },
        onCloseDialog: function () {
            var innerView = this._oView;
            innerView.byId("dynamicDialog").close();
            innerView.byId("dynamicDialog").destroy();
        }
    });

});