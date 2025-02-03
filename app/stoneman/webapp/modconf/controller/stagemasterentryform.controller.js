

sap.ui.define([
    "core/generic/genericentryform",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'stoneman/modone/constants/FormMode',
    "sap/ui/model/json/JSONModel"
],

    function (genericentryform, MessageToast, MessageBox, FormMode, JSONModel) {
        "use strict";
        var _RoleInfo = null, _LoginInfo;
        let formMode;
        let irowIndex;

        return genericentryform.extend("modconfcontroller.stagemasterentryform", {

            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                this.initialize();
            },

            initialize: async function () {
                // _RoleInfo = this.getRoleDetails();
                // _LoginInfo = this.getLoginInfo();
                this.setPageId("stagemasterf");
                this.setFormTitle("Stage Master Form");
                formMode = this.getFormMode();
                this.setBackwardRoute("RouteNameStageMasterConfiguration");

                this.setEntryFormDataSourceURLForNewMode("");

                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MStage");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MStage('" + this.getListViewEditPropertyValue() + "')");
                this.setListViewFilterColumn();


                let oPathSaveReq = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modconf/model/StageMasterSaveRequest.json", //Save Request Model
                );
                // await this.getStageCode();
                let oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
                this.getView().setModel(oModelSaveRequest, "StageMasterSaveRequest");
                if (formMode == '2') {

                    let y = {
                        StageCode: false
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                }


                if (formMode == '3') {

                    let oPath = jQuery.sap.getModulePath(
                        "stoneman",
                        "/modconf/model/StageMasterEntryForm.json", // Edit Response Model
                    );

                    let oModel = new sap.ui.model.json.JSONModel(oPath);
                    this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

                    let y = {
                        StageCode: true
                    }
                    var oModel1 = new JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                }
            },

            onBeforeShow: async function (oEvent) {
                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MStage(" + this.getListViewEditPropertyValue() + ")?$expand=Role($filter=DelMark eq 0),Role($expand=Role)&$filter=DelMark eq 0");
                await this.showEntryForm();
                // await this.getStageCode();
                // await this.getRole();
                this.handleUIOperation();
            },

            handleUIOperation: function () {
                const formMode = this.getFormMode();
                if (formMode === 3) {
                    // this.handleFormInEditMode();
                }
            },

            handleFormInEditMode: function () {
                const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                const { Role = [], StageCodeArray = [], StageCode = "" } = viewModel.getData();
                Role.forEach((element, index) => {
                    element.RowNumber = index + 1
                });
                viewModel.setProperty(`/Role`, Role);
                const email = [
                    {
                        "id": "N",
                        "name": "No"
                    },
                    {
                        "id": "Y",
                        "name": "Yes"
                    }
                ]
                const { EnumDescription = '' } = StageCodeArray.find(item => item.EnumCode === StageCode)
                viewModel.setProperty(`/EmailNotification`, email);
                viewModel.setProperty(`/Role`, Role);
                viewModel.setProperty(`/Description`, EnumDescription);
            },

            getStageCode: async function () {
                await this.createNewModelUsingAPI(
                    'GET',
                    `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'STAGECODE'`,
                    '',
                    'StageModel'
                );
                const data = this.getView().getModel('StageModel').getData();
                const { value = [] } = data || {};
                const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/StageCodeArray`, value);
            },

            getRole: async function () {
                await this.createNewModelUsingAPI(
                    'GET',
                    `/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0`,
                    '',
                    'MRoleModel'
                );
                const data = this.getView().getModel('MRoleModel').getData();
                const { value = [] } = data || {};
                const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/RoleType`, value);
            },


            // onSave: async function () {
            //   // Get source and target objects
            //   let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            //   let trgObject = this.getView().getModel("MenuMasterSaveRequestModel").getData();

            //   // Assuming we want to gather selected items from srcObject
            //   const selectedItems = srcObject.items.filter(item => item.selected); // Adjust this logic based on your data structure

            //   if (selectedItems.length === 0) {
            //     MessageToast.show("No items selected for saving.");
            //     return;
            //   }

            //   // Transfer values from the source to the target object
            //   this.transferObjectValues(srcObject, trgObject);

            //   // Add the selected items to the target object
            //   trgObject.selectedItems = selectedItems; // Adjust this structure based on your API requirements

            //   console.log('requestObject', trgObject);

            //   try {
            //     // Call the function to handle the actual save
            //     await this.onPressOfEntryFormSaveButton(trgObject);
            //     let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();

            //     if (response) {
            //       MessageToast.show("Menu created successfully: " + response.MenuId);
            //       setTimeout(function () {
            //         this.router.navTo(this.getBackwardRoute());
            //       }.bind(this), 500);
            //     }
            //   } catch (error) {
            //     console.error("Error saving data:", error);
            //     MessageToast.show("Error saving data.");
            //   }
            // },


            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },

            getParentMenuStageCodeModel: async function () {
                await this.createNewModelUsingAPI(
                    "GET",
                    `/odata/v4/stoneman-crf/MMenu?$filter=ParentMenuCode ne '-1'`,
                    "",
                    "menuresponsemodel"
                );

                const menuResponse = this.getView().getModel("menuresponsemodel");
                let aData = menuResponse.getData();
                //const apiModel = menuResponse.oData.value;
                aData.value.unshift({ MenuName: 'Please Select' });
                menuResponse.setData(aData);
                this.getView().setModel(menuResponse, "menuresponsemodel");

                //console.log({ apiModel });
            },






            onSave: async function () {
                if (this.isFormValid()){


                let oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let oData = oModel.getData();
                //let oModel2 = this.getView().getModel("StageMasterSaveRequest");
                //let oData2 = oModel2.getData();
                console.log('oData    ', JSON.stringify(oData));
                //console.log('oData2    ', JSON.stringify(oData2));



                const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                const { Role = [] } = viewModel.getData();
                console.log("Role ", Role)
                let hasDuplicate = false;

                // Iterate over Role to check for duplicates
                for (let i = 0; i < Role.length; i++) {
                    const currentMenuGuid = Role[i].Role_RoleGuid;
                    // Role[i].RoleType = parseInt(Role[i].RoleType);
                    // Check if the Role_RoleGuid is already used in another row
                    for (let j = i + 1; j < Role.length; j++) {
                        if (Role[j].Role_RoleGuid === currentMenuGuid && currentMenuGuid !== null) {
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
                } else {
                    const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                    let trgObject = this.getView().getModel("StageMasterSaveRequest").getData();
                    console.log("Target Object:", trgObject);
                    console.log("SRC_____", modelData)

                    this.transferObjectValues(modelData, trgObject);
                    await this.onPressOfEntryFormSaveButton(trgObject);
                    console.log("No duplicate found. Proceeding with save...", viewModel.getData());
                    let response = this.getApiResponseObject();;
                    if (response.success) {
                        console.log("No duplicate found. Proceeding with save..okok.");
                        this.router.navTo(this.getBackwardRoute());
                    }
                    else {
                        MessageToast.show(response.object.responseJSON.error.message);
                    }
                }



                // if (oData.StageCode_StageConstant[0].StageCode_StageConstant != null) {
                //     var duplicates = this.findDuplicateEntries(oData.StageCode_StageConstant);
                //     if (duplicates.length > 0) {
                //         MessageToast.show('Duplicate entries found in StageCode! Please Add Unique Row', duplicates);
                //         return;
                //     }
                // }

                // if (oData.StageCode_StageConstant === null || oData.StageName === null ||
                //     oData.StageDesc === null || oData.IsActive === null || oData.IsWorkFlow === null ||
                //     oData.IsApproval === null || oData.FormType === null || oData.SendEmail === null) {
                //     MessageToast.show('please enter required field')
                //     return
                // };


                // let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                // let trgObject = this.getView().getModel("StageMasterSaveRequest").getData();
                // var oCheckBox = this.byId("isActiveCheckBox");
                // var isActiveSelected = oCheckBox.getSelected();

                // srcObject.IsActive = isActiveSelected ? 'Y' : 'N';
                // var oCheckBox = this.byId("workflowCheckBox");
                // var workflowSelected = oCheckBox.getSelected();

                // var oCheckBox = this.byId("isApprovalCheckBox");
                // var isApprovalSelected = oCheckBox.getSelected();

                // var oCheckBox = this.byId("sendEmailCheckBox");
                // var sendEmailSelected = oCheckBox.getSelected();

                // srcObject.IsWorkFlow = workflowSelected ? 'Y' : 'N';
                // srcObject.IsApproval = isApprovalSelected ? 'Y' : 'N';
                // srcObject.SendEmail = sendEmailSelected ? 'Y' : 'N';
                // srcObject.OrderBy = Number(oData.OrderBy);
                // srcObject.NoOfApprovals = Number(oData.NoOfApprovals);
                // srcObject.NoOfRejections = Number(oData.NoOfRejections);


                // this.transferObjectValues(srcObject, trgObject);
                // console.log('requestObject', trgObject)
                // await this.onPressOfEntryFormSaveButton(trgObject);

                // const res = this.getApiResponseObject();
                // //let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
                // if (res.success == true) {
                //     MessageToast.show("Stage created successfully " + response.StageCode);
                //     setTimeout(function () {
                //         this.router.navTo(this.getBackwardRoute());
                //     }.bind(this), 500);
                // }
                // else {
                //     MessageToast.show(res.object.responseJSON.error.message);
                // }

            }},

            onCheckBoxSelect: function (oEvent) {
                // Get the selected state of the CheckBox
                //var bSelected = oEvent.getParameter("selected");
                var isApprovalSelected = oEvent.getParameter("selected") ? 'Y' : 'N';
                // Update the model property based on the CheckBox selection
                let oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                //let oModel = cgetModel(this.getEntryFormDataSourceModelName());
                oModel.setProperty("/IsApproval", isApprovalSelected);
                oModel.refresh(true);
            },
            addRow: function () {
                var newRow = {
                    "RoleCode": null,
                    "isDelete": null,
                    "RowNumber": 1,
                    "Description": null,
                    "Role_RoleGuid": null,
                    "DelMark": 0,
                    "RoleType": null
                };
                this.addRowInObj('Role', newRow, 'RowNumber');
            },

            


            onDeleteStage: function (oEvent) {
                // Step 1: Get the source of the event (e.g., the button)
                var oButton = oEvent.getSource();

                // Step 2: Get the binding context of the row containing the button
                var oBindingContext = oButton.getBindingContext(this.getEntryFormDataSourceModelName());

                if (!oBindingContext) {
                    console.error("Binding context not found");
                    return;
                }

                // Step 3: Extract the full data path and calculate the index
                var sPath = oBindingContext.getPath(); // e.g., "/Role/1"
                console.log("Binding Path:", sPath);

                var iIndex = parseInt(sPath.split("/").pop(), 10); // Extract the last part of the path
                console.log("Calculated Index:", iIndex);

                // Step 4: Access the data model and retrieve data
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var aData = oModel.getProperty("/Role");

                // Step 5: Confirm deletion
                MessageBox.show("Are you sure you want to delete record?", {
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this.updateStageRoleModel(iIndex);
                        }
                    }.bind(this)
                });
            },

            updateStageRoleModel: function (iIndex) {
                // Access the model
                const modelName = this.getEntryFormDataSourceModelName();

                //const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(modelName, 'Role', iIndex);
                // var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // var aData = oModel.getProperty("/Role");

                // // Remove the item from the model
                // if (iIndex >= 0 && iIndex < aData.length) {
                //     aData.splice(iIndex, 1);
                // }

                // // Recalculate RowNumber
                // aData = aData.map((item, i) => ({
                //     ...item,
                //     RowNumber: i + 1
                // }));

                // // Update the model
                // oModel.setProperty("/Role", aData);

                // // // Refresh the binding to update the UI
                // var oTable = this.getView().byId("smStageRoleTable");
                // if (oTable) {
                //     var oBinding = oTable.getBinding("items");
                //     if (oBinding) {
                //         oBinding.refresh();
                //     } else {
                //         console.warn("No binding found for the table items.");
                //     }
                // }

                console.log("Updated Role Data:", aData);
            },


            onStageCodeChange: function (oEvent) {

                const oComboBox = oEvent.getSource();

                const oSelectedItem = oComboBox.getSelectedItem();

                // Access the binding context of the selected item
                if (oSelectedItem) {
                    const oBindingContext = oSelectedItem.getBindingContext("EntryFormDataSourceModel");
                    if (oBindingContext) {
                        const { EnumCode = '', EnumDescription = '' } = oBindingContext.getObject();
                        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                        viewModel.setProperty(`/StageCode`, EnumCode);
                        viewModel.setProperty(`/Description`, EnumDescription);
                    }
                }
            },

            onStageRoleChange: function (oEvent) {
                const oComboBox = oEvent.getSource(); // Get ComboBox reference
                const oSelectedItem = oComboBox.getSelectedItem(); // Get selected item
                const sSelectedKey = oSelectedItem ? oSelectedItem.getKey() : ""; // MenuGuid
                const sSelectedText = oSelectedItem ? oSelectedItem.getText() : ""; // Description

                // Get the binding context of the current row
                const oContext = oComboBox.getBindingContext(this.getEntryFormDataSourceModelName());
                const sPath = oContext.getPath();

                // Access the model
                const oModel = oContext.getModel();
                const { Role = [] } = oModel.getData();

                // Check if the selected MenuGuid already exists in another row
                let isDuplicate = false;
                for (let i = 0; i < Role.length; i++) {
                    if (i !== parseInt(sPath.split('/').pop()) && Role[i].Role_RoleGuid === sSelectedKey) {
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
                }
                // Update the current row's Role_RoleGuid and Description
                oModel.setProperty(sPath + "/Role_RoleGuid", sSelectedKey);
                oModel.setProperty(sPath + "/Description", sSelectedText);
            },

            cflForStageCode: async function () {
                let Ourl = `/odata/v4/stoneman-crf/MEnum`;
                await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Stage Code']);
                this.setCflDataColumns(['EnumCode']);
                this.setCflValueAndDisplay("/EnumCode", "EnumCode", '', '');
                this.showCfl("stgcode", this.getCflListViewDataSourceModelName(), "value", this.onClosecflStageCode.bind(this));
            },

            onClosecflStageCode: function () {
                let x = this.getCflObject();
                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/StageCode`, x.EnumCode);
                viewModel.setProperty(`/Description`, x.EnumDescription);
            },

            cflForRole: async function (oEvent) {
                const oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
                const rowIndex = oContext.getPath().split('/').pop();
                irowIndex = rowIndex;

                let Ourl = `/odata/v4/stoneman-crf/MRole?$filter=DelMark eq 0`;
                await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['RoleCode']);
                this.setCflDataColumns(['RoleCode']);
                this.setCflValueAndDisplay(`/Role/${irowIndex}/RoleCode`, "RoleCode", '', '');
                this.showCfl("rolcode", this.getCflListViewDataSourceModelName(), "value", this.onClosecflRole.bind(this));
            },

            onClosecflRole: function () {
                let x = this.getCflObject();
                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/Role/${irowIndex}/RoleCode`, x.RoleCode);
                viewModel.setProperty(`/Role/${irowIndex}/Role_RoleGuid`, x.RoleGuid);
            },

            cflForRoleType: async function (oEvent) {
                const oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
                const rowIndex = oContext.getPath().split('/').pop();
                irowIndex = rowIndex;

                let Ourl = `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'ROLETYPE'`;
                await this.createNewModelUsingAPI('GET', Ourl, null, this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Role Menu Type', 'Role Menu Code', 'Role Menu Description']);
                this.setCflDataColumns(['EnumType', 'EnumCode', 'EnumDescription']);
                this.setCflValueAndDisplay(`/Role/${irowIndex}/RoleType`, "EnumType", '', '');
                this.showCfl("roletype", this.getCflListViewDataSourceModelName(), "value", this.onClosecflRoleType.bind(this));
            },

            onClosecflRoleType: function () {
                let x = this.getCflObject();
                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // const RoleType = parseInt();
                viewModel.setProperty(`/Role/${irowIndex}/RoleType`, x.EnumCode);
                // if(x.EnumType == "NEWCODE"){
                //     const numRoleType = parseInt(x.EnumCode)
                //     console.log("TYPE_______", RoleType)
                //     viewModel.setProperty(`/RoleType`, numRoleType);
                // }
                // viewModel.setProperty(`/RoleType`, RoleType);


            },

            onSelect: function (oEvent) {
                const bSelected = oEvent.getParameter('selected');
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        
                if (bSelected === true) {
                  y.setProperty(`/IsApproval`, 'Y');
                } else {
                  y.setProperty(`/IsApproval`, 'N');
                }
              },
              changeSelect1: function (oEvent) {
                const oComboBox = oEvent.getSource(); // Get ComboBox reference
                const oSelectedItem = oComboBox.getSelectedItem(); // Get selected item
                const sSelectedKey = oSelectedItem ? oSelectedItem.getKey() : ""; // MenuGuid
                const sSelectedText = oSelectedItem ? oSelectedItem.getText() : ""; // Description
                console.log('oSelectedItem-----------', sSelectedKey);
                console.log('oSelectedItem-----------', sSelectedText);

                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/SendAppNotification`, sSelectedKey);
            },
              changeSelect2: function (oEvent) {
                const oComboBox = oEvent.getSource(); // Get ComboBox reference
                const oSelectedItem = oComboBox.getSelectedItem(); // Get selected item
                const sSelectedKey = oSelectedItem ? oSelectedItem.getKey() : ""; // MenuGuid
                const sSelectedText = oSelectedItem ? oSelectedItem.getText() : ""; // Description
                console.log('oSelectedItem-----------', sSelectedKey);
                console.log('oSelectedItem-----------', sSelectedText);

                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                viewModel.setProperty(`/SendEmail`, sSelectedKey);
            },

            isFormValid: function () {
                let isValid = true;
        
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        
                const StageCode = y.getProperty('/StageCode');
                const Description = y.getProperty('/Description');
                const SendEmail = y.getProperty('/SendEmail');
                const SendAppNotification = y.getProperty('/SendAppNotification');
                const IsApproval = y.getProperty('/IsApproval');
        
                const oData = y.getData();
        
                if (
                    (StageCode === undefined || StageCode === null || StageCode === '') &&
                    (Description === undefined || Description === null || Description === '') &&
                    (SendEmail === undefined || SendEmail === null || SendEmail === '') &&
                    (SendAppNotification === undefined || SendAppNotification === null || SendAppNotification === '')
                ) {
                    isValid = false;
                    MessageToast.show('All Field is mandatory, Please Field data!');
                    return isValid;
                } else if (StageCode === undefined || StageCode === null || StageCode === '') {
                    isValid = false;
                    MessageToast.show('Please Enter StageCode !');
                    return isValid;
                } else if (( Description === undefined || Description === null || Description === '' )) {
                  isValid = false;
                  MessageToast.show('Please Enter ParentMenuCode !');
                  return isValid;
                } else if (SendEmail === undefined || SendEmail === null || SendEmail === '') {
                    isValid = false;
                    MessageToast.show('Please Enter SendEmail !');
                    return isValid;
                }  else if (SendAppNotification === undefined || SendAppNotification === null || SendAppNotification === '') {
                  isValid = false;
                  MessageToast.show('Please Enter SendAppNotification !');
                  return isValid;
                } 
                
        
                return isValid;
            },
        });
    }
);
