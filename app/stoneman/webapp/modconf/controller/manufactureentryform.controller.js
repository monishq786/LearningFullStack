sap.ui.define(
    [
        'core/generic/genericentryform',
        'sap/m/MessageToast'
    ],
    function (genericentryform, MessageToast) {
        var mfdCodeguid ="";
        'use strict';
        return genericentryform.extend('modconfcontroller.manufactureentryform', {
            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                // this.initialize();

            },

            onBeforeShow: async function (oEvent) {
                this.initialize();
                this.identifyFormMode(oEvent);
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/MManufacturing('" + this.getListViewEditPropertyValue() + "')");
                await this.showEntryForm();
            },

            initialize: async function () {
                this.setPageId('manufactureef');
                this.setFormTitle('manufacture Entry Form');
                this.setBackwardRoute('RouteNameLanding');

                this.setEntryFormDataSourceURLToAddData("");
                this.setEntryFormDataSourceURLToUpdateData("");

                const formMode = this.getFormMode();
                //  if (formMode === FormMode.CREATE) {//add
                let oPath = jQuery.sap.getModulePath(
                    "stoneman",
                    "/model/Manufactureentryform.json",
                );
                let oModel = new sap.ui.model.json.JSONModel(oPath);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                // }
                console.log(oModel)
            },

            cflForManufactureCode:async function(){
                await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MManufacturing', '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Manufacturing Code', 'Manufacturing Name']);
                this.setCflDataColumns(['ManufacturingCode','ManufacturingName']);
                this.setCflValueAndDisplay('/ManufacturingCode', 'ManufacturingCode', '', '');
                this.showCfl('Manufacturing_Code_EntryForm', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForManufactureCode.bind(this));
            },

            cflForManufactureName:async function(){
                await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MManufacturing', '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Manufacturing Code', 'Manufacturing Name']);
                this.setCflDataColumns(['ManufacturingCode','ManufacturingName']);
                this.setCflValueAndDisplay('/ManufacturingCode', 'ManufacturingCode', '', '');
                this.showCfl('Manufacturing_Code_EntryForm', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForManufactureCode.bind(this));
            },

            cflForOperationCode: async function(){
                // await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MOperationProcess?$filter=Parent_ManufacturingGuid eq '+mfdCodeguid, '', this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI('GET', 'odata/v4/stoneman-crf/MOperationProcess','', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Operation Process Code', 'OperationProcess Name']);
                this.setCflDataColumns(['OperationProcessCode','OperationProcessName']);
                this.setCflValueAndDisplay('/OperationProcessCode', 'OperationProcessCode', '', '');
                this.showCfl('OperationcodeEntryForm', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForOperationCode.bind(this));
            },

            onClosecflForManufactureCode:function(){
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty('/ManufacturingCode', x.ManufacturingCode);
                y.setProperty('/ManufacturingName', x.ManufacturingName);
                mfdCodeguid=x.ManufacturingGuid;
                console.log(mfdCodeguid)
            },

            onClosecflForOperationCode:function (){
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty('/OperationProcessCode', x.OperationProcessCode);
                y.setProperty('/OperationProcessName', x.OperationProcessName);
                // y.setProperty('/ManufacturingName', x.ManufacturingName);
            },

            addRow: function () {
                var newRow = {
                    SrNo: "",
                    OperationCode: "",
                    OperationName: ""
                };
                this.addRowInObj('data', newRow, "SrNo");
            },
            

            onDeleteField: function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(this.getEntryFormDataSourceModelName(), "data", iIndex)
            },

            isFormValid: function () {
                let isValid = true;

                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

                const ManufacturingCode = y.getProperty('/ManufacturingCode');
                const ManufacturingName = y.getProperty('/ManufacturingName');
                const OperationProcessCode = y.getProperty('/OperationProcessCode');
                const OperationProcessName = y.getProperty('/OperationProcessName');
                

                const oData = y.getData();
                // var oCheckBox = this.byId("qisActiveCheckBox");
                //     var isActiveSelected = oCheckBox.getSelected();

                //     checkboxvalue = isActiveSelected ? 'Y' : 'N';

                if (
                    (ManufacturingCode === undefined || ManufacturingCode === null || ManufacturingCode === '') &&
                    (ManufacturingName === undefined || ManufacturingName === null || ManufacturingName === '') &&
                    (OperationProcessCode === undefined || OperationProcessCode === null || OperationProcessCode === '') &&
                    (OperationProcessName === undefined || OperationProcessName === null || OperationProcessName === '') 
                    
                ) {
                    isValid = false;
                    MessageToast.show('All Field is mandatory, Please Field data!');
                    return isValid;
                } else if (ManufacturingCode === undefined || ManufacturingCode === null || ManufacturingCode === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Template Code !');
                    return isValid;
                } else if (ManufacturingName === undefined || ManufacturingName === null || ManufacturingName === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Teamplate Description!');
                    return isValid;
                } else if (OperationProcessCode === undefined || OperationProcessCode === null || OperationProcessCode === '') {
                    isValid = false;
                    MessageToast.show('Please Enter Field type');
                    return isValid;
                } else if (OperationProcessName === undefined || OperationProcessName === null || OperationProcessName === '') {
                    isValid = false;
                    MessageToast.show('Please enter Subject!');
                    return isValid;
                }
                return true;
            },
            

            createObjectTarget: function () {
                const x = {
                    ManufacturingCode : null,
                    ManufacturingName : null,
                    // DelMark           : null,
                    // Remarks           : null,
                    Operation         : [
                                            {
                                                OperationProcessCode      : null,
                                                OperationProcessName      : null,
                                            }
                                        ]
                };

                return x;
            },

            onSave: async function () {
                if (this.isFormValid()) {
                    let modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                    console.log(modelData , "===================================");

                    let y = this.createObjectTarget();

                    this.transferObjectValues(modelData, y);
                    console.log(y , "----------------------------------------");
                    // await this.onPressOfEntryFormSaveButton(y);

                    const res = this.getApiResponseObject();
                    if (res.success === true) {
                        if (this.screen === 'add') {
                            MessageToast.show('');
                        } else {
                            MessageToast.show('');
                        }
                        setTimeout(
                            function () {
                                this.router.navTo(this.getBackwardRoute());
                            }.bind(this),
                            Constant.SCREEN_NAV_TIMEOUT
                        );
                    } else {
                        MessageToast.show(res.object.responseJSON.error.message);
                    }

                }
            }
        });
    }
);
