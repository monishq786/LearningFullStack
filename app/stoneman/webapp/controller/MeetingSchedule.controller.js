sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel" // Import ODataModel for OData V4
], function (Controller, MessageToast, JSONModel, ODataModel) {
    "use strict";
    
    return Controller.extend("capwithhanaui.controller.MeetingSchedule", {

        onInit: function() {
            var oViewModel = new JSONModel({
                TimeSlots: [],
                isMeetingEnabled: false, // Controls the meeting generation button
                sSelectedSlot : "Not Selected"

            });
            // var employeeModel = new JSONModel({
                
            // })
            // this.getView().setModel(employeeModel, "emp");
            this.getView().setModel(oViewModel);

            // Initialize ODataModel for OData V4 backend calls (replace with your OData service URL)
            var oDataModel = new ODataModel({
                serviceUrl: "/odata/v4/meeting/", // Ensure this points to your OData service
                synchronizationMode: "None",// Important for V4 model
                operationMode: "Server",
                autoExpandSelect: true,
                groupId: "$auto"
            });
            this.getView().setModel(oDataModel, "odata"); // Bind ODataModel with the name 'odata'

            // // Bind the Employees table to the Employees entity set
            // var oTable = this.byId("employeeTable1");
            // oTable.setModel(oDataModel, "odata"); // Set the OData model for the table
            // oTable.bindItems({
            //     path: "odata>/Employees", // Bind to the Employees entity set
            //     template: new sap.m.ColumnListItem({
            //         cells: [
            //             new sap.m.Text({ text: "{odata>name}" }), // Employee Name
            //             new sap.m.Text({ text: "{odata>availableFrom}" }),
            //             new sap.m.Text({ text: "{odata>availableTo}" }),
            //             new sap.m.Text({ text: "{odata>availableText}" }) // Availability status (to be filled after check)
            //         ]
            //     })
            // });
            // var oTable1 = this.byId("employeeTable1")
            // var datamodel = oTable1.getBindingContext("odata").getObject();
            // console.log(datamodel);
            // console.log(oDataModel);
        // this.checkEmployeeAvailability();
        // console.log("Pass");
        var test = this.getView().bindElement({
            path: "/Employees", // Bind to the Employees entity set
            model: "odata"      // Assuming your OData model is named 'odata'
        });
        console.log(this.getView().getModel("odata"));

        },
        checkEmployeeAvailability : function () {
            var oView = this.getView();
            var employeeId = "c0d57e36-bb76-4c1b-9b08-e1234567890f"; // Replace with dynamic input if needed
            var slotStart = "2024-10-10T10:00:00Z"; // Replace with dynamic input if needed
            var slotEnd = "2025-02-28T17:00:00Z"; // Replace with dynamic input if needed
        
            // Construct the action path
            var actionPath = "/checkEmployeeAvailability"; // Omit leading '/' for V4
        
            // Define parameters for the action
            var parameters = {
                employeeID: employeeId,
                slotStart: slotStart,
                slotEnd: slotEnd
            };
        
            // Call the action using the OData V4 model
            oView.getModel("odata").callFunction(actionPath, {
                method: "POST",
                urlParameters: parameters,
                success: function (data) {
                    console.log("Action response:", data);
                    // You can handle the response data here, e.g., displaying a message
                    MessageBox.alert("Employee availability checked successfully: " + data);
                },
                error: function (error) {
                    console.error("Error calling action:", error);
                    MessageBox.alert("Error checking availability: " + error.message, {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error"
                    });
                }
            });
        },        

        onGenerateTimeSlots: function() {
            var oView = this.getView(),
                oModel = oView.getModel(),
                sStartDateTime = oView.byId("startDateTime").getDateValue(),
                sEndDateTime = oView.byId("endDateTime").getDateValue(),
                iInterval = parseInt(oView.byId("intervalInput1").getValue(), 10),
                aTimeSlots = [];

            if (!sStartDateTime || !sEndDateTime || !iInterval) {
                MessageToast.show("Please enter valid start time, end time, and interval.");
                return;
            }

            // Generate time slots
            var currentSlot = new Date(sStartDateTime);
            var endSlot = new Date(sEndDateTime);

            while (currentSlot < endSlot) {
                var nextSlot = new Date(currentSlot.getTime() + iInterval * 60000);
                if (nextSlot > endSlot) break;

                aTimeSlots.push({
                    SlotID: currentSlot.toISOString(),
                    SlotDescription: currentSlot.toLocaleTimeString() + " - " + nextSlot.toLocaleTimeString()
                });
                currentSlot = nextSlot;
            }

            oModel.setProperty("/TimeSlots", aTimeSlots);
            MessageToast.show("Time slots generated successfully!");
        },

        onCheckAvailability: function (oEvent) {
            var oModel = this.getView().getModel(), // Use the OData model named 'odata'
                sSelectedSlot = this.byId("timeSlotComboBox").getSelectedKey(), // Selected time slot ID from the dropdown
                oTable = this.byId("employeeTable1"), // Assuming your table ID is 'employeeTable'
                aTimeSlots = oModel.getProperty("/TimeSlots"); // Fetch available time slots
        
            var oSelectedSlot = aTimeSlots.find(slot => slot.SlotID === sSelectedSlot); // Find the selected time slot object
        
            if (!sSelectedSlot || !oSelectedSlot) {
                sap.m.MessageToast.show("Please select a time slot first.");
                return;
            }
        
            // Convert selected slot start and end times
            var slotStart = new Date(oSelectedSlot.SlotID);
            var slotEnd = new Date(slotStart.getTime() + (60 * 60 * 1000)); // Assuming the slot is 1 hour long
        
            // Get the binding of the table (assuming it is bound to /Employees)
            var oBinding = oTable.getBinding("items");
        
            // Iterate through each employee and check availability
            oBinding.getContexts().forEach(function (oContext) {
                var oEmployee = oContext.getObject(), // Get the employee object
                    sEmployeeAvailableFrom = oEmployee.availableFrom, // Employee's available from time
                    sEmployeeAvailableTo = oEmployee.availableTo; // Employee's available to time
        
                var availableFrom = new Date(sEmployeeAvailableFrom),
                    availableTo = new Date(sEmployeeAvailableTo);
        
                // Check if the selected slot is within the employee's available time
                var bAvailable = slotStart >= availableFrom && slotEnd <= availableTo;
        
                // Update the employee's availability status
                var sAvailabilityText = bAvailable ? "Available" : "Not Available";
                oContext.setProperty("availableText", sAvailabilityText); // Update availability text in the model context
            });
        
            // // Submit batch to save changes in OData (if needed for persistence)
            // oModel.submitBatch("$auto").then(function () {
            //     sap.m.MessageToast.show("Availability checked for all employees.");
            // }).catch(function (oError) {
            //     sap.m.MessageToast.show("Error checking availability: " + oError.message);
            // });
        
            // Refresh the table binding to reflect the changes
            oBinding.refresh();
        },
        onTimeSlotChange: function (oEvent) {
            var oComboBox = oEvent.getSource(); // Get the ComboBox that triggered the change event
            var sSelectedKey = oComboBox.getSelectedKey(); // Get the selected key of the ComboBox
        
            if (sSelectedKey) {
                var aTimeSlots = this.getView().getModel().getProperty("/TimeSlots"); // Get the time slots from the model
                var oSelectedSlot = aTimeSlots.find(slot => slot.SlotID === sSelectedKey); // Find the selected slot
        
                if (oSelectedSlot) {
                    this.getView().getModel().setProperty("/sSelectedSlot",oSelectedSlot.SlotDescription)
                    MessageToast.show("Selected time slot: " + oSelectedSlot.SlotDescription);
                }
            } else {
                MessageToast.show("No time slot selected.");
            }
        },        

        onGenerateMeeting: function() {
            var oModel = this.getView().getModel(),
                sSelectedSlot = this.byId("timeSlotComboBox").getSelectedKey();

            if (oModel.getProperty("/isMeetingEnabled") && sSelectedSlot) {
                MessageToast.show("Meeting generated successfully!");
            } else {
                MessageToast.show("Cannot generate meeting, no available employee selected.");
            }
        }
    });
});
