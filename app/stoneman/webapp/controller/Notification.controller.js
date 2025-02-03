sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function (Controller,JSONModel) {
    'use strict';
    return Controller.extend("stoneman.controller.Notification", {
        constructor: function (oView, title, from) {
            this._oView = oView;
            this._title = title;
        },
        onInit: function () {
            console.log("I am called")
            var oModel = new JSONModel(sap.ui.require.toUrl("stoneman/webapp/model/notifications.json"));
			this.getView().setModel(oModel);
		},

	    
    });

});