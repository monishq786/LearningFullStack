sap.ui.define([

    "core/generic/genericentryform",
    "sap/m/MessageToast",
    'sap/ui/core/routing/History',
],
    function (genericentryform, MessageToast, History) {
        "use strict";
        let irowIndex;
        let formMode;
        var _RoleInfo = null, _LoginInfo;
        return genericentryform.extend("modconfcontroller.emailtemplateentryform", {

            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                // this.initialize();

            },

            initialize: async function () {
                _RoleInfo = this.getRoleDetails();
                _LoginInfo = this.getLoginInfo();
                this.setPageId("emailtemplateef");
                this.setFormTitle("E-Mail Template Entry Form");
                this.setBackwardRoute("RouterNameEMailTemplateForm");
                formMode = this.getFormMode();
                this.setEntryFormDataSourceURLForNewMode("");
                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/MEmailTemplate");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/MEmailTemplate(" + this.getListViewEditPropertyValue() + ")");

                var oPath = jQuery.sap.getModulePath(
                    "stoneman",
                    "/model/EmailTemplateAddView.json",
                );
                var oModel = new sap.ui.model.json.JSONModel(oPath);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                let oPath2 = jQuery.sap.getModulePath(
                    "stoneman",
                    "/model/EMailTemplateSaveView.json",
                );
                let oModel2 = new sap.ui.model.json.JSONModel(oPath2);
                this.getView().setModel(oModel2, "saverequest");
                this.loadFragments(["emailtemplate"]);
                console.log(formMode);
                if (formMode == "3") {
                    console.log("add");
                    let y = {
                        EnableTempCode: true
                    }
                    var oModel1 = new sap.ui.model.json.JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');

                } else {
                    console.log("edit")
                    let y = {
                        EnableTempCode: false
                    }
                    var oModel1 = new sap.ui.model.json.JSONModel(y);
                    oModel1 = this.getView().setModel(oModel1, 'EnableCheck');
                }

                await this.ButtonDiable();
            },

            cflForTempCode: async function () {
                await this.createNewModelUsingAPI('GET', "/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'NOTIFYTYPE'", '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Template Code', 'Description']);
                this.setCflDataColumns(['EnumCode', 'EnumDescription']);
                this.setCflValueAndDisplay('/EnumCode', 'EnumCode', '', '');
                // this.setCflValueAndDisplay('', '', 'templateCode', 'EnumCode');
                this.showCfl('templateCode', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForTempCode.bind(this));
            },
            onClosecflForTempCode: function () {
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty('/NotifyTemplateCode', x.EnumCode);
                y.setProperty('/Description', x.EnumDescription);
                y.setProperty('/Type', x.EnumType);
            },
            cflForMenuCode: async function () {
                await this.createNewModelUsingAPI('GET', "/odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0", '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['MenuCode']);
                this.setCflDataColumns(['MenuCode']);
                this.setCflValueAndDisplay('/MenuCode', 'MenuCode', '', '');

                this.showCfl('MenuName', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForMenuCode.bind(this));
            },
            onClosecflForMenuCode: function () {
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty('/MenuCode', x.MenuCode);
                y.setProperty('/MenuGuid_MenuGuid', x.MenuGuid);

                console.log(x.MenuGuid);

            },

            onLiveChange: function (oEvent) {
                // Prevent user from typing into the input field
                const oInput = oEvent.getSource();
                oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
            },
            ButtonDiable: async function () {
                let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
                await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
                let myModel = this.getView().getModel("myModel").getData();
                const filteredData = myModel.value.filter(item => item.MenuCode);
                for (const Data of filteredData) {
                    if (Data.Update == false && Data.MenuCode.MenuName == 'Email Template Configuration') {
                        let oView = this.getView();
                        oView.byId('Savebtn').setEnabled(false);
                    }
                };
            },

            // loadFragments: function (fragments) {
            //     fragments.forEach(this.loadFragment.bind(this));
            // },

            // loadFragment: function (fragmentName) {
            //     const oView = this.getView();
            //     const sectionId = fragmentName.toLowerCase() + "Section"; // Dynamically assign section ID
            //     sap.ui.core.Fragment.load({
            //         id: oView.getId(),
            //         name: `stoneman.modconf.fragment.emailtemplatefragment.${fragmentName}`,
            //         controller: this
            //     }).then(function (oFragment) {
            //         oView.byId(sectionId).addItem(oFragment);
            //     });
            // },


            onBeforeShow: async function (oEvent) {
                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MEmailTemplate(" + this.getListViewEditPropertyValue() + ")");
                this.showEntryForm();



            },
            isFormValid: function () {
                let isValid = true;

                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

                const TempCode = y.getProperty('/NotifyTemplateCode');
                const TempDesc = y.getProperty('/Description');
                const MenuCode = y.getProperty('/MenuCode');
                const TempSubject = y.getProperty('/NotifyTemplateSubject');
                const TempBody = y.getProperty('/NotifyTemplateBody');
                const BrowserNotification = y.getProperty('/NotificationBody')
                const Active = y.getProperty('/IsActive');

                const oData = y.getData();

                if (
                    (TempCode === undefined || TempCode === null || TempCode === '') &&
                    (TempDesc === undefined || TempDesc === null || TempDesc === '') &&
                    (MenuCode === undefined || MenuCode === null || MenuCode === '') &&
                    (TempSubject === undefined || TempSubject === null || TempSubject === '') &&
                    (BrowserNotification === undefined || BrowserNotification === null || BrowserNotification === '') &&
                    (TempBody === undefined || TempBody === null || TempBody === '') &&
                    (Active === undefined || Active === null || Active === '')
                ) {
                    isValid = false;
                    MessageToast.show('All Field is mandatory, Please Field data!');
                    return isValid;
                } else if (TempCode === undefined || TempCode === null || TempCode === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Template Code!');
                    return isValid;
                } else if (TempDesc === undefined || TempDesc === null || TempDesc === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Teamplate Description!');
                    return isValid;
                }
                else if (MenuCode === undefined || MenuCode === null || MenuCode === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Menu Name!');
                    return isValid;
                }
                else if (TempSubject === undefined || TempSubject === null || TempSubject === '') {
                    isValid = false;
                    MessageToast.show('Please enter Subject!');
                    return isValid;
                }
                else if (TempBody === undefined || TempBody === null || TempBody === '') {
                    isValid = false;
                    MessageToast.show('Please Enter  Email Template Content!');
                    return isValid;
                } else if (BrowserNotification === undefined || BrowserNotification === null || BrowserNotification === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Browser Notification Content!');
                    return isValid;
                } else if (Active === undefined || Active === null || Active === '') {
                    isValid = false;
                    MessageToast.show('Please Select Checkbox!');
                    return isValid;
                }
                return isValid;
            },

            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },
            onSelect: function (oEvent) {
                const bSelected = oEvent.getParameter('selected');
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

                if (bSelected === true) {
                    y.setProperty(`/IsActive`, 'Y');
                } else {
                    y.setProperty(`/IsActive`, 'N');
                }
            },
            onSave: async function () {
                if (this.isFormValid()) {

                    let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                    let trgObject = this.getView().getModel("saverequest").getData();

                    var oCheckBox = this.byId("qisActiveCheckBox");
                    var isActiveSelected = oCheckBox.getSelected();

                    srcObject.IsActive = isActiveSelected ? 'Y' : 'N';

                    this.transferObjectValues(srcObject, trgObject);


                    await this.onPressOfEntryFormSaveButton(trgObject);
                    // let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
                    let response = this.getApiResponseObject();
                    // console.log(response);
                    // if (response.success === true) {
                    if (response.success === true && this.getFormMode() == "3") {
                        MessageToast.show("Email template created successfully");
                        setTimeout(function () {
                            this.router.navTo(this.getBackwardRoute());
                        }.bind(this), 500);
                    }
                    else if (response.success === true && this.getFormMode() == "2") {
                        MessageToast.show("Email template updated successfully ");
                        setTimeout(function () {
                            this.router.navTo(this.getBackwardRoute());
                        }.bind(this), 500);
                    }
                    // }
                    else {
                        MessageToast.show(response.object.responseJSON.error.message);
                    }
                }
            }
        })
    }
)