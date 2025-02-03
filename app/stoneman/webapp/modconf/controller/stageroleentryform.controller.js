sap.ui.define([
    'core/generic/genericentryform',
    "sap/m/MessageToast",
], function (genericentryform, MessageToast) {
    var _RoleInfo = null, _LoginInfo;
    return genericentryform.extend('modconfcontroller.stageroleentryform', {
        onInit: function () {
            genericentryform.prototype.onInit.apply(this, arguments);
            const oPath = jQuery.sap.getModulePath('stoneman', '/model/stageroleentryform.json');
            const oModel = new sap.ui.model.json.JSONModel(oPath);
            this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
        },

        onBeforeShow: async function (oEvent) {
            this.identifyFormMode(oEvent);
            this.initialise();
            this.setEntryFormDataSourceURLForEditMode(
                '/odata/v4/stoneman-crf/MStageRole(' + this.getListViewEditPropertyValue() + ')'
            );
            await this.showEntryForm();
        },

        initialise: async function () {
            _RoleInfo = this.getRoleDetails();
            _LoginInfo = this.getLoginInfo();
            this.setPageId('stageroleef');
            this.setFormTitle('Stage Role Entry Form');
            this.setBackwardRoute('RouteNameStageRoleMasterConfiguration');
            this.setEntryFormDataSourceURLForNewMode('');
            this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MStageRole');
            this.setEntryFormDataSourceURLToUpdateData('/odata/v4/stoneman-crf/MStageRole(' + this.getListViewEditPropertyValue() + ')');
            await this.ButtonDiable();
        },

        ButtonDiable: async function () {
            let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
            await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
            let myModel = this.getView().getModel("myModel").getData();
            const filteredData = myModel.value.filter(item => item.MenuCode);
            for (const Data of filteredData) {
                if (Data.Update == false && Data.MenuCode.MenuName == 'Stage Role Configuration') {
                    let oView = this.getView();
                    oView.byId('StageRole_Button').setEnabled(false);
                }
            };
        },

        //This function create for Stage Code CFL Open and select  
        cflForStageRole: async function () {
            await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MStage', '', this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Stage Code']);
            this.setCflDataColumns(['StageCode_StageConstant', 'StageCode_StageConstant']);
            this.setCflValueAndDisplay('/StageCode_StageConstant', 'StageCode_StageConstant', '', '');
            this.showCfl('stage_StageCode_EntryForm', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForStageCode.bind(this));
        },

        //this function use for set value in payload
        onClosecflForStageCode: function () {
            const x = this.getCflObject();
            const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
            y.setProperty('/StageCode_StageCode_StageConstant', x.StageCode_StageConstant);
        },

        //This function create for Stage Code CFL Open and select  
        cflForRoleCode: async function () {
            await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MRole', '', this.getCflListViewDataSourceModelName());
            this.setCflDisplayColumns(['Role Code']);
            this.setCflDataColumns(['RoleCode_RoleConstant', 'RoleCode_RoleConstant']);
            this.setCflValueAndDisplay('/RoleCode_RoleConstant', 'RoleCode_RoleConstant', '', '');
            this.showCfl('stage_RoleCode_EntryForm', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForRoleCode.bind(this));
        },

        //this function use for set value in payload
        onClosecflForRoleCode: function () {
            const x = this.getCflObject();
            const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
            y.setProperty('/RoleCode_RoleCode_RoleConstant', x.RoleCode_RoleConstant);
        },

        //this function use for Validation fiels
        isValidate: function () {
            let isValid = true;
            const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            if (y.RoleCode_RoleCode_RoleConstant == undefined || y.RoleCode_RoleCode_RoleConstant == null) {
                isValid = false;
                sap.m.MessageToast.show('Please select RoleCode...');
            } else if (y.StageCode_StageCode_StageConstant == undefined || y.StageCode_StageCode_StageConstant == null) {
                sap.m.MessageToast.show(' select StageCode..');
            } else if (y.ValidationCode == undefined || y.ValidationCode == null) {
                sap.m.MessageToast.show('Please Fill ValidationCode..');
            }
            return isValid;
        },

        createObjectTarget: function () {
            const x = {
                RoleCode_RoleCode_RoleConstant: null,
                StageCode_StageCode_StageConstant: null,
                ValidationCode: null,
                IsActive: null
            };

            return x;
        },

        onCheckBoxSelect: function (oEvent) {
            var isactiveSelected = oEvent.getParameter("selected") ? 'Y' : 'N';
            let oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
            oModel.setProperty("/IsActive", isactiveSelected);
            oModel.refresh(true);
        },

        onSave: async function () {

            if (this.isValidate()) {
                let modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

                modelData.RoleCode_RoleCode_RoleConstant = modelData.RoleCode_RoleCode_RoleConstant;
                modelData.StageCode_StageCode_StageConstant = modelData.StageCode_StageCode_StageConstant;
                modelData.ValidationCode = modelData.ValidationCode;
                modelData.IsActive = modelData.IsActive;

                let y = this.createObjectTarget();

                this.transferObjectValues(modelData, y);

                await this.onPressOfEntryFormSaveButton(y);

                const res = this.getApiResponseObject();

                if (res.success == true) {
                    MessageToast.show("StageRole created successfully " + res.RoleCode_RoleCode_RoleConstant);
                    setTimeout(function () {
                        this.router.navTo(this.getBackwardRoute());
                    }.bind(this), 500);
                }
                else {
                    MessageToast.show(res.object.responseJSON.error.message);
                }
            }
        },

        onCancel: async function () {
            this.router.navTo(this.getBackwardRoute());

        },



    });

});