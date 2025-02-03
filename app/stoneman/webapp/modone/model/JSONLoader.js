sap.ui.define([
    "jquery.sap.global"
], function (jQuery) {
    "use strict";

    return {
        loadJSONData: function (sRelativePath) {
            return new Promise(function (resolve, reject) {
                // Generate the full path using the module path and the relative path passed as an argument
                let sFullPath = jQuery.sap.getModulePath("stoneman", sRelativePath);
                $.ajax({
                    url: sFullPath,
                    dataType: "json",
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (xhr, status, error) {

                        reject("Error loading JSON file: " + status + ", " + error);
                    }
                });
            });
        }

    };
});
