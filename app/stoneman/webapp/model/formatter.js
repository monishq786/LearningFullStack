sap.ui.define([

], function () {
    "use strict";
    return {
        getDateFromatIn_ddMMyyyy: function (oDate) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });
            var date = new Date(oDate);
            var cDate = oDateFormat.format(date);
            //console.log(cDate);
            return cDate;
        },
        getDateFromatIn_MMddyyyy: function (oDate) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "MM-dd-yyyy"
            });
            var date = new Date(oDate);
            var cDate = oDateFormat.format(date);
            //console.log(cDate);
            return cDate;
        },
        getDateFromatIn_yyyyMMdd: function (oDate) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd"
            });
            var date = new Date(oDate);
            var cDate = oDateFormat.format(date);
            //console.log(cDate);
            return cDate;
        },
        getDateFromatIn_dMMMyyyy: function (oDate) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "d MMM yyyy"
            });
            var date = new Date(oDate);
            var cDate = oDateFormat.format(date);
            //console.log(cDate);
            return cDate;
        },
        getDateFromatIn_ddMMyyyy_HHmm: function (oDate) {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy, hh:mm a"  // Format for date and time
            });
            var date = new Date(oDate);  // Create a Date object
            var cDate = oDateFormat.format(date);  // Format the date and time
            return cDate;
        },
    }
});