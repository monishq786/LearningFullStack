sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, ODataModel, JSONModel) {
        "use strict";
        var selectedTimeSlot;
        var interval;
        return Controller.extend("capwithhanaui.controller.Main", {
            onInit: function () {
                // var oModel = this.getOwnerComponent().getModel("localOdata");
                // var oModel = this.getOwnerComponent().getModel("NorthwindOdata");

                // var oModel2 = this.getOwnerComponent().getModel("HanaOdata");
                // var oModel3 = this.getOwnerComponent().getModel("StonemanOdata");


                var oModel = new ODataModel({
                    serviceUrl: "/odata/v4/catalog/",
                    synchronizationMode: "None",
                    operationMode: "Server",
                    autoExpandSelect: true,
                    groupId: "$auto"
                });
                this.getView().setModel(oModel, "EmployeeModel")


                var oTimeSlotModel = new sap.ui.model.json.JSONModel({
                    endTime: "",
                    startTIme: ""
                });
                this.getView().setModel(oTimeSlotModel, "timeSlotModel");

            },

            onSubmit: function () {
                // Get values from the input fields
                var startTime1 = this.byId("startTimePicker").getValue();
                var endTime1 = this.byId("endTimePicker").getValue();
                var interval1 = parseInt(this.byId("intervalInput").getValue(), 10);
                interval = interval1;
                // Validate inputs
                if (!startTime1 || !endTime1 || isNaN(interval1) || interval1 <= 0) {
                    sap.m.MessageToast.show("Please fill in all fields correctly.");
                    return;
                }

                // Generate time slots
                this._generateTimeSlots(startTime1, endTime1, interval1);
            },

            _generateTimeSlots: function (startTime, endTime, interval) {
                var timeSlots = [];
                var start = this._timeToMinutes(startTime);
                var end = this._timeToMinutes(endTime);

                for (var time = start; time <= end; time += interval) {
                    var timeString = this._minutesToTime(time);
                    var period = timeString.includes('AM') ? 'AM' : 'PM'; // Determine if it is AM or PM

                    // Push an object with value, label, and added (AM/PM)
                    timeSlots.push({
                        value: timeString.trim(),  // The actual time value (trimmed to remove extra spaces)
                        label: timeString.slice(0, 5),  // The label can be the same as the value (trimmed)
                        added: period               // AM or PM
                    });
                }

                // Creating a JSON object with timeSlots array
                var jsonOutput = {
                    timeSlots: timeSlots
                };

                // Set the model with the JSON object
                var oModel1 = new JSONModel(jsonOutput);
                this.getView().setModel(oModel1);

                // Log the generated JSON format
                console.log(JSON.stringify(jsonOutput, null, 2)); // Log the JSON output in a readable format
                var matrix = [];
                var row = [];

                for (var i = 0; i < 40; i++) {
                    if (i < timeSlots.length) {
                        row.push(timeSlots[i]);  // Add time slot to the row
                    } else {
                        row.push({ value: "", label: "", added: "" });  // Add empty slots if no more time slots
                    }

                    // Every 5 cells, push the row into the matrix and reset the row
                    if ((i + 1) % 5 === 0) {
                        matrix.push(row);
                        row = [];
                    }
                }

                // Convert the matrix to JSON format
                var jsonMatrix = JSON.stringify(matrix);
                console.log(jsonMatrix);
                console.log(matrix);


                // Create lists for each column in a 5x8 structure
                var lists = {
                    list1: [],
                    list2: [],
                    list3: [],
                    list4: [],
                    list5: []
                };

                for (var i = 0; i < timeSlots.length; i++) {
                    var columnIndex = i % 5;  // Calculate column index

                    // Push the time slot into the corresponding list
                    if (columnIndex === 0) lists.list1.push(timeSlots[i]);
                    else if (columnIndex === 1) lists.list2.push(timeSlots[i]);
                    else if (columnIndex === 2) lists.list3.push(timeSlots[i]);
                    else if (columnIndex === 3) lists.list4.push(timeSlots[i]);
                    else if (columnIndex === 4) lists.list5.push(timeSlots[i]);
                }
                console.log(lists);
                var oModel10 = new JSONModel(lists);
                this.getView().setModel(oModel10, "listjson");

            },

            _timeToMinutes: function (time) {
                var parts = time.split(':');
                return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            },

            _minutesToTime: function (minutes) {
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;

                // Convert to 12-hour format
                var period = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12; // Convert to 12-hour format
                hours = hours ? hours : 12; // If hours is 0, set it to 12

                return (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins + ' ' + period;
            },





            // open dilog
            onOpenDialog: function () {
                if (!this.byId("itemDialog")) {
                    this.loadFragment({
                        name: "your.fragment.namespace.Dialog"
                    }).then(function (oDialog) {
                        oDialog.open();
                    });
                } else {
                    this.byId("itemDialog").open();
                }
            },

            onCloseDialog: function () {
                this.byId("itemDialog").close();
            },

            onOpenDialog1: function () {
                if (!this.byId("itemDialog1")) {
                    this.loadFragment({
                        name: "your.fragment.namespace.Dialog"
                    }).then(function (oDialog) {
                        oDialog.open();
                    });
                } else {
                    this.byId("itemDialog1").open();
                }
            },
            onTimeSlotSelect: function (oEvent) {
                var oSelectedItem = oEvent.getSource();
                var sSelectedTime = oSelectedItem.getTitle();

                // Clear any previous selection from all lists
                this._clearPreviousSelection();

                // Update the selected time slot
                this._selectedTimeSlot = sSelectedTime;
                selectedTimeSlot = sSelectedTime;
                // Visually mark the selected item
                oSelectedItem.addStyleClass("selectedTimeSlot"); // Add CSS class for styling
            },

            // Clear previous selection from all lists
            _clearPreviousSelection: function () {
                var aLists = ["list1", "list2", "list3", "list4", "list5"]; // List IDs
                var oView = this.getView();

                // Loop through all lists and clear the "selectedTimeSlot" class
                aLists.forEach(function (sListId) {
                    var oList = oView.byId(sListId);
                    var aItems = oList.getItems();

                    aItems.forEach(function (oItem) {
                        oItem.removeStyleClass("selectedTimeSlot"); // Remove the highlight
                    });
                });
            },

            // When "OK" button is pressed
            onOkButtonPress: function () {
                if (this._selectedTimeSlot) {
                    sap.m.MessageToast.show("Selected Time Slot: " + this._selectedTimeSlot);
                } else {
                    sap.m.MessageToast.show("No time slot selected!");
                }

                // Close the dialog
                this.onCloseDialog1();
            },


            onCloseDialog1: function () {
                this.byId("itemDialog1").close();
            },


            // data collection 


            // Helper function to convert time string to Date object
            _timeStringToDate: function (timeString) {
                var timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/);
                var hours = parseInt(timeParts[1], 10);
                var minutes = parseInt(timeParts[2], 10);
                var period = timeParts[3];

                // Convert to 24-hour format
                if (period === "PM" && hours < 12) {
                    hours += 12;
                }
                if (period === "AM" && hours === 12) {
                    hours = 0;
                }

                var date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(0);
                date.setMilliseconds(0);

                return date;
            },

            onSelectionChange: function (oEvent) {
                // Get the selected item
                var oSelectedItem = oEvent.getParameter("listItem");
                if (oSelectedItem) {
                    // Get the binding context of the selected item
                    var oContext = oSelectedItem.getBindingContext("EmployeeModel");
                    if (oContext) {
                        // Get the data for the selected employee
                        var oEmployeeData = oContext.getObject();
                        console.log("Selected Employee Data:", oEmployeeData);
                        var result = this._getMeetingTimeInterval(selectedTimeSlot, interval);

                        console.log(result.originalTime, result.newTime);
                        if (oEmployeeData.startTime < result.originalTime && oEmployeeData.endTime > result.newTime) {
                            sap.m.MessageToast.show("Time slot Available");
                        } else {
                            sap.m.MessageToast.show("No time slot Available");
                        }
                        // Access specific properties
                        var id = oEmployeeData.ID;
                        var name = oEmployeeData.name;
                        var startTime = oEmployeeData.startTime;
                        var endTime = oEmployeeData.endTime;
                        console.log(id, name, startTime, endTime)
                        // Do something with the selected employee data
                    }
                }
            },
            _getMeetingTimeInterval: function (timeStr, minutesToAdd) {
                // Create a Date object from the time string
                var date = new Date();

                // Parse the input time string
                var timeParts = timeStr.match(/(\d+):(\d+) (AM|PM)/);

                if (!timeParts) {
                    throw new Error("Invalid time format. Expected hh:mm AM/PM.");
                }

                // Extract hours, minutes, and period (AM/PM)
                var hours = parseInt(timeParts[1], 10);
                var minutes = parseInt(timeParts[2], 10);
                var period = timeParts[3];

                // Convert to 24-hour format
                if (period === "PM" && hours < 12) {
                    hours += 12;
                }
                if (period === "AM" && hours === 12) {
                    hours = 0;
                }

                // Set hours and minutes in the Date object
                date.setHours(hours, minutes, 0, 0);

                // Store the original time in 24-hour format
                var originalTime24 = this.formatTime24Hour(date);

                // Add the minutes
                date.setMinutes(date.getMinutes() + minutesToAdd);

                // Format the new time back to 24-hour format
                var newTime24 = this.formatTime24Hour(date);

                return {
                    originalTime: originalTime24,
                    newTime: newTime24
                };
            },

            formatTime24Hour: function (date) {
                var hours = date.getHours();
                var minutes = date.getMinutes();

                minutes = minutes < 10 ? '0' + minutes : minutes;

                return hours + ':' + minutes;
            }

        });
    });
