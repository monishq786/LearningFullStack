sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, JSONModel) {
        "use strict";
        return Controller.extend("modonecontroller.attachmentDialog", {
            onInit: function () {

            },


            onCloseDialog1: function () {
                this.byId("attachmentDialog").close();
            },

        
        });
    });