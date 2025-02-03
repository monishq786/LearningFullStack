sap.ui.define([
    "core/generic/genericentryform",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'stoneman/modone/constants/FormMode',
], function (genericentryform, MessageToast, MessageBox, FormMode) {
    'use strict';
    var _RoleInfo = null, _LoginInfo;

    return genericentryform.extend("modonecontroller.menuroleentryform", {
        onInit: function () {
            genericentryform.prototype.onInit.apply(this, arguments);
            //this.initialize();
        },

        initialize: async function () {
            _RoleInfo = this.getRoleDetails();
            _LoginInfo = this.getLoginInfo();
            this.setPageId('TITLEMENUROLE');
            const oPath = jQuery.sap.getModulePath('stoneman', '/modconf/model/MenuRoleEntryForm.json');
            const oModel = new sap.ui.model.json.JSONModel(oPath);
            this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
            this.setFormTitle('Menu Role Master');
            this.loadPayloadRequest();
            this.setBackwardRoute("RouteNameMenuRoleConfiguration");
            this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MMenuRoleAccess');
            this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MMenuRoleAccess(" + this.getListViewEditPropertyValue() + ")");
        },

        loadPayloadRequest: function () {
            let oPath2 = jQuery.sap.getModulePath("stoneman", "/modconf/model/MenuRoleEntryFormSaveRequest.json");

            // Fetch JSON data synchronously
            let jsonData = jQuery.sap.sjax({
                url: oPath2,
                dataType: "json"
            });

            // Check if the data was fetched
            if (jsonData.success) {
                let oModel2 = new sap.ui.model.json.JSONModel();
                oModel2.setData(jsonData.data);
                this.getView().setModel(oModel2, "MyModel");
                console.log("Model data loaded successfully:", oModel2.getData());
            } else {
                console.error("Failed to load JSON data", jsonData);
            }


        },

        onBeforeShow: async function (oEvent) {
            this.identifyFormMode(oEvent);
            this.initialize();
            this.setEntryFormDataSourceURLForEditMode(
                '/odata/v4/stoneman-crf/MMenuRoleAccess(' + this.getListViewEditPropertyValue() + ')?$filter=DelMark eq 0 &$expand=Detail($filter=DelMark eq 0),Role &$filter=DelMark eq 0'
            );
            await this.showEntryForm();
            await this.getRole();
            this.handleUIOperation();
        },

        handleUIOperation: function () {
            const formMode = this.getFormMode();
            if (formMode === FormMode.EDIT) {
                this.handleFormInEditMode();
            }
        },
        handleFormInEditMode: function () {
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            const { Role = {}, Detail = [] } = viewModel.getData();
            Detail.forEach((element, index) => {
                element.RowNumber = index + 1
            });
            viewModel.setProperty(`/RoleCode`, Role?.RoleCode);
            viewModel.setProperty(`/Description`, Role?.Description);
            viewModel.setProperty(`/Detail`, Detail);
            //For Delete Opration
            this.getView().setModel(JSON.parse(JSON.stringify(Detail)), 'detailsBackupData');
            const data = this.getView().getModel('detailsBackupData');
            console.log('data   ', data)
        },



        getRole: async function () {
            await this.createNewModelUsingAPI(
                'GET',
                `/odata/v4/stoneman-crf/MMenu?filter=DelMark eq '0'`,
                null,
                'MRoleModel'
            );
            const data = this.getView().getModel('MRoleModel').getData();
            const { value = [] } = data || {};
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());

            viewModel.setProperty(`/RoleType`, value);
        },

        onCancel: async function () {
            this.router.navTo(this.getBackwardRoute());
        },

        cflForStageCode: async function () {
            let Ourl = `/odata/v4/stoneman-crf/MRole?$filter=DelMark eq '0'`;
            await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Role Code', 'Description']);
            this.setCflDataColumns(['RoleCode', 'Description']);
            this.setCflValueAndDisplay("RoleCode_Id", "RoleCode", '', '');
            this.showCfl("RoleCode_Id", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForStageCode.bind(this));
        },

        onClosecflForStageCode: function () {
            let { RoleCode, RoleGuid, Description } = this.getCflObject();
            let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            viewModel.setProperty(`/RoleCode`, RoleCode);
            viewModel.setProperty(`/Role_RoleGuid`, RoleGuid);
            viewModel.setProperty(`/Description`, Description);
        },

        isValidate: function () {
            let isValid = true;
            const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            if (y.MenuName == undefined || y.MenuName == null || y.MenuName == '') {
                isValid = false;
                sap.m.MessageToast.show('Please select Menu Name...');
            } else if (y.RoleCode_RoleConstant == undefined || y.RoleCode_RoleConstant == null || y.RoleCode_RoleConstant == '') {
                sap.m.MessageToast.show(' select Menu Role..');
            } else if (y.Add == undefined || y.Add == null) {
                sap.m.MessageToast.show('Please check one Add , View or Update ..');
            }//|| y.Update == undefined || y.Update == null || y.View == undefined || y.View == null
            return isValid;
        },

        addRow: function () {
            var newRow = {
                "Role": null,
                "isDelete": true,
                "RowNumber": 0,
                "Add": false,
                "Update": false,
                "View": true,
                "Menu_MenuGuid": null,
                "Description": null,
                "DelMark": 0
            };
            this.addRowInObj('Detail', newRow, 'RowNumber');
        },
        changeSelect: function (event) {
            console.log('event', event);
        },

        onDeleteMenuRole: function (oEvent) {
            var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            var aData = oModel.getData();
            MessageBox.show("Are you sure you want to delete record?", {
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        aData.Detail.splice(iIndex, 1);
                        aData.Detail = aData.Detail.map((item, i) => ({
                            ...item,
                            RowNumber: i + 1 // Recalculate RowNumber for remaining items
                        }));
                        oModel.setData(aData);
                        oModel.setProperty("/Detail", aData.Detail);
                    }

                }
            })

        },

        onMenuRoleChange2: function (oEvent) {
            const oComboBox = oEvent.getSource(); // Get ComboBox reference
            const oSelectedItem = oComboBox.getSelectedItem(); // Get the selected item
            const sSelectedKey = oSelectedItem ? oSelectedItem.getKey() : ""; // MenuGuid
            const sSelectedText = oSelectedItem ? oSelectedItem.getText() : ""; // Description

            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
            const rowIndex = oContext.getPath().split('/').pop();
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            const { Detail = [] } = viewModel.getData();
            if (Detail.length > 0) {
                Detail[rowIndex].Menu_MenuGuid = sSelectedKey;
                Detail[rowIndex].Description = sSelectedText;
                viewModel.setProperty(`/Detail`, Detail);
            }
        },

        onMenuRoleChange: function (oEvent) {
            const oComboBox = oEvent.getSource(); // Get ComboBox reference
            const oSelectedItem = oComboBox.getSelectedItem(); // Get selected item
            const sSelectedKey = oSelectedItem ? oSelectedItem.getKey() : ""; // MenuGuid
            const sSelectedText = oSelectedItem ? oSelectedItem.getText() : ""; // Description

            // Get the binding context of the current row
            const oContext = oComboBox.getBindingContext(this.getEntryFormDataSourceModelName());
            const sPath = oContext.getPath();

            // Access the model
            const oModel = oContext.getModel();
            const { Detail = [] } = oModel.getData();

            // Check if the selected MenuGuid already exists in another row
            let isDuplicate = false;
            for (let i = 0; i < Detail.length; i++) {
                if (i !== parseInt(sPath.split('/').pop()) && Detail[i].Menu_MenuGuid === sSelectedKey) {
                    isDuplicate = true;
                    break;
                }
            }

            if (isDuplicate) {
                // Display error message if duplicate found
                oComboBox.setValueState("Error");
                oComboBox.setValueStateText("The selected RoleType is already used.");
            } else {
                // Clear any previous errors
                oComboBox.setValueState("None");
                oComboBox.setValueStateText("");

                // Update the current row's Menu_MenuGuid and Description
                oModel.setProperty(sPath + "/Menu_MenuGuid", sSelectedKey);
                oModel.setProperty(sPath + "/Description", sSelectedText);
            }
        },


        onUpdateCheckBoxChange: function (oEvent) {
            const oSource = oEvent.getSource();
            const bIsSelected = oEvent.getParameter("selected"); // True if Update is checked
            const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
            const rowIndex = oContext.getPath().split('/').pop();
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            const { Detail = [] } = viewModel.getData();
            if (Detail.length > 0) {
                Detail[rowIndex].Update = bIsSelected;
                if (bIsSelected) {
                    Detail[rowIndex].View = bIsSelected;
                }
                viewModel.setProperty(`/Detail`, Detail);
            }
        },
        onLiveChange: function (oEvent) {
            // Prevent user from typing into the input field
            const oInput = oEvent.getSource();
            oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
        },
        onViewCheckBoxChange: function (oEvent) {
            const oSource = oEvent.getSource();
            const bIsSelected = oEvent.getParameter("selected");
            const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
            const rowIndex = oContext.getPath().split('/').pop();
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            const { Detail = [] } = viewModel.getData();

            if (Detail.length > 0) {
                if (Detail[rowIndex].Update) {
                    sap.m.MessageToast.show('Can Not change...');
                    Detail[rowIndex].View = true;
                } else {
                    Detail[rowIndex].View = bIsSelected;
                }
                viewModel.setProperty(`/Detail`, Detail);
            }
        },

        onSave: async function () {
            const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            const { Detail = [] } = viewModel.getData();
            let hasDuplicate = false;
            // Iterate over Detail to check for duplicates
            for (let i = 0; i < Detail.length; i++) {
                const currentMenuGuid = Detail[i].Menu_MenuGuid;

                // Check if the Menu_MenuGuid is already used in another row
                for (let j = i + 1; j < Detail.length; j++) {
                    if (Detail[j].Menu_MenuGuid === currentMenuGuid && currentMenuGuid !== null) {
                        hasDuplicate = true;
                        break;
                    }
                }
                if (hasDuplicate) {
                    break;
                }
            }
            if (hasDuplicate) {
                // Display error message if a duplicate is found
                sap.m.MessageBox.error("Duplicate Menu Role detected. Please ensure all Menu Roles are unique.");
                return
            }

            const formMode = this.getFormMode();
            if (formMode === FormMode.EDIT) {
                const viewModel2 = this.getView().getModel(this.getEntryFormDataSourceModelName());
                const modelData = viewModel2.getData();
                const mainDetailList = modelData.Detail;
                const backupDetailList = this.getView().getModel('detailsBackupData'); // Ensure it's getting the data
                const backupMap = new Map(backupDetailList.map((item) => [item.Menu_MenuGuid, { ...item }])); // Clone items to avoid direct mutation

                // Update or add items from mainDetailList to backupMap
                mainDetailList.forEach((item) => {
                    if (backupMap.has(item.Menu_MenuGuid)) {
                        const backupItem = backupMap.get(item.Menu_MenuGuid);
                        backupItem.Add = item.Add;
                        backupItem.Update = item.Update;
                        backupItem.View = item.View;
                        backupItem.DelMark = 0; // Mark as active
                    } else {
                        // Add new item with DelMark = 0
                        backupMap.set(item.Menu_MenuGuid, { ...item, DelMark: 0 });
                    }
                });

                // Mark items as deleted if they are in backupMap but not in mainDetailList
                backupDetailList.forEach((item) => {
                    if (!mainDetailList.some((mainItem) => mainItem.Menu_MenuGuid === item.Menu_MenuGuid)) {
                        const backupItem = backupMap.get(item.Menu_MenuGuid);
                        if (backupItem) {
                            backupItem.DelMark = 1; // Mark as deleted
                        }
                    }
                });

                // Generate the final list from backupMap
                const finalList = Array.from(backupMap.values());
                viewModel.setProperty(`/Detail`, finalList);
            }
            const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            let trgObject = this.getView().getModel("MyModel").getData();
            //console.log("Target Object:", trgObject);
            this.transferObjectValues(modelData, trgObject);
            //console.log("Target Object 2:", trgObject);
            await this.onPressOfEntryFormSaveButton(trgObject);
            console.log("No duplicate found. Proceeding with save...", viewModel.getData());
            let response = this.getApiResponseObject();;
            if (response.success) {
                console.log("No duplicate found. Proceeding with save..okok.");
                this.router.navTo(this.getBackwardRoute());
            }

        }
    });
});
