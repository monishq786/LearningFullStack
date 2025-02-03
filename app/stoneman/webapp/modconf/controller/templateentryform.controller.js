sap.ui.define([

    "core/generic/genericentryform",
    "sap/m/MessageToast",
    'sap/ui/core/routing/History',
    'sap/ui/core/format/DateFormat',
    'stoneman/modone/model/formatter',
    'stoneman/modone/constants/FormMode'
],
    function (genericentryform, MessageToast, History, DateFormat, formatter, FormMode) {
        "use strict";
        let irowIndex;
        var _RoleInfo = null, _LoginInfo;
        return genericentryform.extend("modconfcontroller.templateentryform", {

            onInit: function () {
                genericentryform.prototype.onInit.apply(this, arguments);
                // this.initialize();

            },

            onBeforeShow: async function (oEvent) {
                //this.initialize();
                this.identifyFormMode(oEvent);
                this.setEntryFormDataSourceURLForEditMode('/odata/v4/stoneman-crf/DTemplate(' + this.getListViewEditPropertyValue() + ')?$expand=TemplateStages,TemplateMenus');

                this.initialize();

                await this.showEntryForm();
                // var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                // let ovlue = oModel.getProperty("/ActiveStartDate");
                // let ovalue1 = oModel.getProperty("/ActiveEndDate");

                // let strtdate = this.returnReverceDateFormat(ovlue);
                // let enddate = formatter.getDateFromatIn_yyyyMMdd(ovalue1);


                // oModel.setProperty("/ActiveStartDate", strtdate);
                // oModel.setProperty("/ActiveEndDate", enddate);
                // this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                // let ovalue = formatter.getDateFromatIn_ddMMyyyy_HHmm(this.getView().getModel(this.getEntryFormDataSourceModelName()).getData()["ActiveStartDate"]);
                //console.log(ovalue)
                this.setRowMNumber();
            },

            initialize: async function () {
                _RoleInfo = this.getRoleDetails();
                _LoginInfo = this.getLoginInfo();
                this.setPageId("templatepage");
                this.setFormTitle("Template Entry Form");
                this.setBackwardRoute("RouteNameTemplateConfiguration");
                this.setEntryFormDataSourceURLForNewMode("");
                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/DTemplate");
                this.setEntryFormDataSourceURLToUpdateData('/odata/v4/stoneman-crf/DTemplate(' + this.getListViewEditPropertyValue() + ')');


                var oPath = jQuery.sap.getModulePath(
                    "stoneman",
                    "/model/TemplateAddView.json",
                );
                var oModel = new sap.ui.model.json.JSONModel(oPath);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                let oPath3 = jQuery.sap.getModulePath(
                    "stoneman",
                    "/model/TemplateSaveView.json",
                );

                let oModel2 = new sap.ui.model.json.JSONModel(oPath3);
                this.getView().setModel(oModel2, "saverequest");

                // this.loadFragments(["Header"]);
                // await this.ButtonDiable();


            },

            ButtonDiable: async function () {
                let Ourl = `/odata/v4/stoneman-crf/MenuRole?$filter=RoleCode_RoleConstant eq '${_RoleInfo.RoleCode}'&$expand=MenuCode`;
                await this.createNewModelUsingAPI("GET", Ourl, "", "myModel");
                let myModel = this.getView().getModel("myModel").getData();
                const filteredData = myModel.value.filter(item => item.MenuCode);
                for (const Data of filteredData) {
                    if (Data.Update == false && Data.MenuCode.MenuName == 'Email Template Configuration') {
                        let oView = this.getView();
                        oView.byId('btnSave').setEnabled(false);
                    }
                };
            },
            // if (this.formMode !== FormMode.CREATE) {}

            // loadFragments: function (fragments) {
            //     fragments.forEach(this.loadFragment.bind(this));
            // },

            // loadFragment: function (fragmentName) {
            //     const oView = this.getView();
            //     const sectionId = fragmentName.toLowerCase() + "Section"; // Dynamically assign section ID
            //     sap.ui.core.Fragment.load({
            //         id: oView.getId(),
            //         name: `stoneman.modconf.fragment.templatefragment.${fragmentName}`,
            //         controller: this
            //     }).then(function (oFragment) {
            //         oView.byId(sectionId).addItem(oFragment);
            //     });
            // },



            //  onSave: async function () {


            //     let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
            //     let trgObject = this.getView().getModel("saverequest").getData();



            //  this.transferObjectValues(srcObject, trgObject);


            //      await this.onPressOfEntryFormSaveButton(trgObject);
            //  let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
            //      if (response && this.getFormMode() == "3") {
            //          MessageToast.show(" template created successfully");
            //          setTimeout(function () {
            //              this.router.navTo(this.getBackwardRoute());
            //          }.bind(this), 500);
            //      }
            //      else if (response && this.getFormMode() == "2") {
            //          MessageToast.show("Email template updated successfully ");
            //          setTimeout(function () {
            //              this.router.navTo(this.getBackwardRoute());
            //          }.bind(this), 500);
            //      }
            //  },


            returnReverceDateFormat: function (sDate) {
                const sDate1 = new Date(sDate);
                const formattedDate = new Intl.DateTimeFormat('en-GB').format(sDate1).replace(/\//g, '-');
                return formattedDate
            },
            
            setRowMNumber: function () {
                const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                const aData = oModel.getData();
                
                //convertdate format
                aData.ActiveStartDate = this.returnReverceDateFormat(aData.ActiveStartDate)
                aData.ActiveEndDate = this.returnReverceDateFormat(aData.ActiveEndDate)

                //Menu
                aData.TemplateMenus = aData.TemplateMenus.map((item, i) => ({
                    ...item,
                    RowNumber: i + 1 // Recalculate RowNumber for remaining items
                }));
                oModel.setData(aData);
                oModel.setProperty('/TemplateMenus', aData.TemplateMenus);

                //Stage
                aData.TemplateStages = aData.TemplateStages.map((item, i) => ({
                    ...item,
                    RowNumber: i + 1 // Recalculate RowNumber for remaining items
                }));
                oModel.setData(aData);
                oModel.setProperty('/TemplateStages', aData.TemplateStages);
            },

            cflForStageRole: async function (oEvent) {
                var oSource = oEvent.getSource();
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split('/').pop();
                irowIndex = rowIndex;

                await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MStage?$filter=DelMark eq 0', '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Stage Code', 'Stage Description']);
                this.setCflDataColumns(['StageCode', 'Description']);
                this.setCflValueAndDisplay(`/TemplateStages/${irowIndex}/StageCode`, 'StageCode', '', '');
                this.setCflSearchProperty('StageCode');
                this.showCfl('tempstageCcode', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForStageCode.bind(this));
            },

            //this function use for set value in payload
            onClosecflForStageCode: function () {
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // const customdata = y.getData()
                // console.log("==============================>", y.getData())
                y.setProperty(`/TemplateStages/${irowIndex}/StageCode`, x.StageCode);
                y.setProperty(`/TemplateStages/${irowIndex}/Stage_StageGuid`, x.StageGuid);

                // y.setProperty(`/TemplateStages/customdata/StageSeqId`,customdata[irowIndex].RowNumber);
                // console.log("====After==========================>", y.getData())
                // y.setProperty(`/StageCode/StageCode`, x.StageCode);
                // y.setProperty(`/StageSeqId/StageSeqId`, x.StageSeqId);
                // console.log(x.StageSeqId);
            },



            cflForStageMenu: async function (oEvent) {
                var oSource = oEvent.getSource();
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split('/').pop();
                irowIndex = rowIndex;
                await this.createNewModelUsingAPI('GET', "/odata/v4/stoneman-crf/MMenu?$filter=DelMark eq 0 and ParentMenuCode eq 'FORMS'", '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Menu Code']);
                this.setCflDataColumns(['MenuCode']);
                this.setCflValueAndDisplay(`/TemplateMenus/${irowIndex}/MenuCode`, 'MenuCode', '', '');

                this.showCfl('tempmenu', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForStageMenu.bind(this));
            },



            //this function use for set value in payload
            onClosecflForStageMenu: function () {
                const x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/TemplateMenus/${irowIndex}/Menu_MenuGuid`, x.MenuGuid);
            },



            cflForSubMenu: async function (oEvent) {
                var oSource = oEvent.getSource();
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split('/').pop();
                irowIndex = rowIndex;
                await this.createNewModelUsingAPI('GET', `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'CRFCATEGORY'`, '', this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(['Sub Menu']);
                this.setCflDataColumns(['EnumCode', 'EnumDescription']);
                this.setCflValueAndDisplay(`/TemplateMenus/${irowIndex}/MenuSubType`, 'EnumCode', '', '');
                this.showCfl('submenu', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForsubMenu.bind(this));
            },

            //this function use for set value in payload
            onClosecflForsubMenu: function () {
                const x = this.getCflObject();
                const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/TemplateMenus/${irowIndex}/MenuSubType`, x.EnumCode);
                // y.setProperty('/MenuSubType', x.EnumType);
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
            findDuplicateEntries: function (arr, keys) {
                const seen = {}; // To track unique combinations of the keys
                const duplicates = []; // To store duplicates

                arr.forEach(function (item) {
                    // Generate a composite key from the provided keys
                    const key = keys.map(function (key) {
                        return item[key];
                    }).join('_'); // Combine values using underscore as separator

                    if (seen[key]) {
                        duplicates.push(item); // Add item to duplicates if it's already seen
                    } else {
                        seen[key] = true; // Otherwise, mark this combination as seen
                    }
                });

                return duplicates;
            },


            onSave: async function () {
                let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                let trgObject = this.getView().getModel("saverequest").getData();
                let oDateFormat = DateFormat.getDateInstance({ pattern: 'yyyy-MM-dd' });
                let ActiveStartDate = this.byId('startDate').getDateValue();
                let ActiveEndDate = this.byId('endDate').getDateValue();
                srcObject.ActiveStartDate = oDateFormat.format(ActiveStartDate);
                srcObject.ActiveEndDate = oDateFormat.format(ActiveEndDate);

                srcObject.TemplateStages.map(item => {
                    item.StageSeqId = item.RowNumber
                })
                // console.log(srcObject.TemplateStages)


                // var oCheckBox = this.byId("isactiveCheckBox1");
                // var isActiveSelected = oCheckBox.getSelected();

                // srcObject.IsActive = isActiveSelected ? 'Y' : 'N';
                const duplicates = this.findDuplicateEntries(srcObject.TemplateStages, ['StageCode', 'StageSeqId']);
                if (duplicates.length > 0) {
                    MessageToast.show('Duplicate entries found in Stages! Please Add Unique Row', duplicates);
                    return;
                }
                const duplicatesTemplateMenus = this.findDuplicateEntries(srcObject.TemplateMenus, ['MenuCode',]);
                if (duplicatesTemplateMenus.length > 0) {
                    MessageToast.show('Duplicate entries found in Menu Code! Please Add Unique Row', duplicatesTemplateMenus);
                    return;
                }
                this.transferObjectValues(srcObject, trgObject);
                // console.log('requestObject', trgObject)
                // console.log('SourceObject', srcObject)
                await this.onPressOfEntryFormSaveButton(trgObject);
                const res = this.getApiResponseObject();

                if (res.success == true) {
                    MessageToast.show("Template created successfully " + res.RoleCode_RoleCode_RoleConstant);
                    setTimeout(function () {
                        this.router.navTo(this.getBackwardRoute());
                    }.bind(this), 500);
                }
                else {
                    MessageToast.show(res.object.responseJSON.error.message);
                }
                // if (res.success === true && formMode === '3') {
                //     MessageToast.show('Template created successfully');
                //     setTimeout(
                //         function () {
                //             this.router.navTo(this.getBackwardRoute());
                //         }.bind(this),
                //         1000
                //     );
                // } else if (res.success === true && formMode === '2') {
                //     MessageToast.show('Template Updated successfully');
                //     setTimeout(
                //         function () {
                //             this.router.navTo(this.getBackwardRoute());
                //         }.bind(this),
                //         1000
                //     );
                // } else {
                //     MessageToast.show(res.object.responseJSON.error.message);
                //     setTimeout(
                //         function () {
                //             this.router.navTo(this.getBackwardRoute());
                //         }.bind(this),
                //         1000
                //     );
                // }

            },

            onCancel: async function () {
                this.router.navTo(this.getBackwardRoute());

            },


            onDeleteStage: function (oEvent) {
                const modelName = this.getEntryFormDataSourceModelName();
                const oModel = this.getView().getModel(modelName);
                const aData = oModel.getData();

                if (aData.TemplateStages.length === 1) {
                    MessageToast.show('Atleast one stage should be there.');
                } else {
                    const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                    this.deleteRow(modelName, 'TemplateStages', iIndex);
                }
            },

            addMenuRow: function () {
                var newRow = {
                    RowNumber: 1,
                    MenuCode: null,
                    MenuSubType: null
                };
                this.addRowInObj('TemplateMenus', newRow, 'RowNumber');
            },

            addStageRow: function () {
                var newRow = {
                    RowNumber: 1,
                    StageCode: null,
                    StageSeqId: 1,
                    Stage_StageGuid: null
                };
                this.addRowInObj('TemplateStages', newRow, 'RowNumber');
                let srcObjectStagesq = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                srcObjectStagesq.TemplateStages.map(item => {
                    item.StageSeqId = item.RowNumber
                })
            },



            onDelete: function (oEvent) {
                const modelName = this.getEntryFormDataSourceModelName();
                const oModel = this.getView().getModel(modelName);
                const aData = oModel.getData();

                if (aData.TemplateMenus.length === 1) {
                    MessageToast.show('Atleast one menu should be there.');
                } else {
                    const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                    this.deleteRow(modelName, 'TemplateMenus', iIndex);
                }
            },







        })
    }
)