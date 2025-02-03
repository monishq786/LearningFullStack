sap.ui.define([
    "core/generic/genericentryform"
],
    function (genericentryform) {
        "use strict";

        return genericentryform.extend("modonecontroller.newprint", {
            onInit: function () {

                genericentryform.prototype.onInit.apply(this, arguments);


                var oData = {
                    "ProductCollection": [
                        {
                            "SupplierName": "Supplier A",
                            "Name": "Product A1",
                            "ProductId": "P001",
                            "Width": 30,
                            "Depth": 20,
                            "Height": 15,
                            "DimUnit": "cm",
                            "WeightMeasure": 1.5,
                            "WeightUnit": "kg",
                            "Price": 100,
                            "CurrencyCode": "USD"
                        },
                        {
                            "SupplierName": "Supplier A",
                            "Name": "Product A2",
                            "ProductId": "P002",
                            "Width": 35,
                            "Depth": 25,
                            "Height": 20,
                            "DimUnit": "cm",
                            "WeightMeasure": 2,
                            "WeightUnit": "kg",
                            "Price": 150,
                            "CurrencyCode": "USD"
                        },
                        {
                            "SupplierName": "Supplier A",
                            "Name": "Product A3",
                            "ProductId": "P003",
                            "Width": 40,
                            "Depth": 30,
                            "Height": 25,
                            "DimUnit": "cm",
                            "WeightMeasure": 2.5,
                            "WeightUnit": "kg",
                            "Price": 170,
                            "CurrencyCode": "USD"
                        },
                        {
                            "SupplierName": "Supplier B",
                            "Name": "Product B1",
                            "ProductId": "P004",
                            "Width": 50,
                            "Depth": 30,
                            "Height": 25,
                            "DimUnit": "cm",
                            "WeightMeasure": 3.5,
                            "WeightUnit": "kg",
                            "Price": 200,
                            "CurrencyCode": "EUR"
                        },
                        {
                            "SupplierName": "Supplier B",
                            "Name": "Product B2",
                            "ProductId": "P005",
                            "Width": 55,
                            "Depth": 35,
                            "Height": 30,
                            "DimUnit": "cm",
                            "WeightMeasure": 4,
                            "WeightUnit": "kg",
                            "Price": 220,
                            "CurrencyCode": "EUR"
                        },
                        {
                            "SupplierName": "Supplier C",
                            "Name": "Product C1",
                            "ProductId": "P006",
                            "Width": 60,
                            "Depth": 40,
                            "Height": 35,
                            "DimUnit": "cm",
                            "WeightMeasure": 5,
                            "WeightUnit": "kg",
                            "Price": 250,
                            "CurrencyCode": "GBP"
                        },
                        {
                            "SupplierName": "Supplier C",
                            "Name": "Product C2",
                            "ProductId": "P007",
                            "Width": 65,
                            "Depth": 45,
                            "Height": 40,
                            "DimUnit": "cm",
                            "WeightMeasure": 5.5,
                            "WeightUnit": "kg",
                            "Price": 270,
                            "CurrencyCode": "GBP"
                        }
                    ]
                };

                // Create a JSON model and set the data


                this.createNewModelUsingArray('ProductCollection', oData)
                var oModel = this.getView().getModel("ProductCollection");  // Get the model from the view
                console.log(oModel.getData());           // Print the entire model data to the console
                console.log(oModel.getProperty('/ProductCollection'));

            },

            onBeforeShow: function (oEvent) {
                this.initialize(oEvent);
            },

            initialize: function (oEvent) {

                this.identifyFormMode(oEvent);
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/TCrfHeader(" + this.getListViewEditPropertyValue() +
                    ')?$expand=Team,Material');
                this.showEntryForm();

            },

            onPressPrint: function () {
                window.print();
            }
        });

    });