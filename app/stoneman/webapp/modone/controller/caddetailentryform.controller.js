sap.ui.define([
    "core/generic/genericentryform",
    "./SeekAdviceCommentDialog.controller",
    "./ApproveRejectFragment.controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    'sap/ui/core/routing/History',
    "sap/m/Image",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "stoneman/modone/model/formatter",
    "sap/ui/core/format/DateFormat",
],
    function (genericentryform, SeekAdviceCommentDialog, ApproveRejectFragment, MessageToast, Dialog, History, Image, PDFViewer, JSONModel, formatter, DateFormat) {
        "use strict";

        let irowIndex = 0;
        let _oSelectedRowContext = null;
        let absIDMainAssembly = '';
        let absIDSubAssembly = [];
        let absIDChildAssembly = [];
        let absIDSeekAdvice = [];
        let _aBase64Files = [];
        let _aBase64FilesMainAssembly = {};
        let _aBase64FilesSubAssembly = [];
        let _aBase64FilesChildAssembly = [];
        let _aBase64FilesSeekAdvice = [];
        let _fileData = [];
        var _fileDataSub = [];
        var _fileDataChild = [];
        let _fileDataSeek = [];
        let _fileDataAttachment = [{}];
        let oSelectDiamension;
        let oSelectDiameter;

        let role;
        let loginInfo;
        let enableDisableArrayForBtn = [];
        let myName;
        let sstageCode;
        return genericentryform.extend("moduleonecontroller.caddetailentryform", {
            constructor: function () {
                // Initialize properties here

                this.irowIndex = 0;
                this._oSelectedRowContext = null;
                this.absIDMainAssembly = '';
                this.absIDSubAssembly = [];
                this.absIDChildAssembly = [];
                this.absIDSeekAdvice = [];
                this._aBase64Files = [];
                this._aBase64FilesMainAssembly = {};
                this._aBase64FilesSubAssembly = [];
                this._aBase64FilesChildAssembly = [];
                this._aBase64FilesSeekAdvice = [];
                this._fileData = [];
                this._fileDataChild = [];
                this._fileDataSub = [];
                this._fileDataSeek = [];
                this._fileDataAttachment = []; // Initialize as an empty array
                this.guid = null;
            },
            onInit: function () {

                genericentryform.prototype.onInit.apply(this, arguments);
                //this.loadFragments(["CADDetailHeader", "CADDetailDimensions", "CADDetailAttachment", "CADDetailMainAssembly", "CADDetailSubAssembly", "CADDetailChildAssembly", "CADDetailSeekAdvice", "CADDetailProgress"]);



            },
            onPressLogout: function () {
                var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
                oStorage.put(null);
                sap.ui.getCore().getEventBus().publish("Logout", "rowSelectEvent", '');
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteLogin", {}, true);
            },

            initialize: async function () {

                this.setPageId("caddetailef");
                this.setFormTitle("CAD Detail Entry Form");
                this.setBackwardRoute("RouterNameCADDetailListView_new");

                this.setEntryFormDataSourceURLToAddData("/odata/v4/stoneman-crf/TCadDetail");
                this.setEntryFormDataSourceURLToUpdateData("/odata/v4/stoneman-crf/TCadDetail(" + this.getListViewEditPropertyValue() + ")");

                let oPath2 = jQuery.sap.getModulePath(
                    "stoneman",
                    "/modone/model/CADDetailSaveRequest.json",
                );
                let oModel2 = new sap.ui.model.json.JSONModel(oPath2);
                this.getView().setModel(oModel2, "saverequest");
                this.absIDMainAssembly = '';
                this.absIDSubAssembly = [];
                this.absIDChildAssembly = [];
                this.absIDSeekAdvice = [];
                this._aBase64Files = [];
                this._aBase64FilesMainAssembly = {};
                this._aBase64FilesSubAssembly = [];
                this._aBase64FilesChildAssembly = [];
                this._aBase64FilesSeekAdvice = [];
                this._fileData = [{}];
                this._fileDataChild = [{}];
                this._fileDataSub = [];
                this._fileDataSeek = [{}];
                this._fileDataAttachment = [{}];

                loginInfo = this.getLoginInfo();
                role = this.getRoleDetails();
                myName = loginInfo['Username'];
                var oViewModel = new JSONModel({ myName: myName });
                this.getView().setModel(oViewModel, "view");
                if (role.RoleName == "DTP_ASSISTANT") {

                    let model = this.getView().getModel(this.getEntryFormDataSourceModelName());
                    model.setProperty("/DTPAssitantName", loginInfo.Username);
                    model.setProperty("/DTPAssitant_UserID", loginInfo.UserID);
                    this.getView().setModel(model, this.getEntryFormDataSourceModelName());
                }
                let model1 = this.getView().getModel(this.getEntryFormDataSourceModelName());
                model1.setProperty("/CreatedByUserID_UserID", loginInfo.UserID);
                model1.setProperty("/loginUserID_UserID", loginInfo.UserID);
                this.getView().setModel(model1, this.getEntryFormDataSourceModelName());


                if (role.RoleCode == 'DTP_HEAD') {
                    this.byId("caddetail_CAD_btnApprove").setVisible(true);
                    this.byId("caddetail_CAD_btnReject").setVisible(true);
                    this.byId("caddetail_btnSave").setVisible(false);
                    this.byId("caddetail_btnSubmit").setVisible(false);
                    this.byId("caddetail_cadReqNo").setEnabled(false);
                    this.byId("caddetail_caddetailefdtpheadname").setEnabled(false);
                }
                if (role.RoleCode == 'DTP_ASSISTANT') {
                    this.byId("caddetail_CAD_btnApprove").setVisible(false);
                    this.byId("caddetail_CAD_btnReject").setVisible(false);
                    this.byId("caddetail_btnSave").setVisible(true);
                    this.byId("caddetail_btnSubmit").setVisible(true);
                    this.byId("caddetail_cadReqNo").setEnabled(true);
                    this.byId("caddetail_caddetailefdtpheadname").setEnabled(true);
                }
                if (this.getFormMode() == "3") {
                    let oPath = jQuery.sap.getModulePath(
                        "stoneman",
                        "/modone/model/CADDetailAddViewNew.json",
                    );
                    let oModel = new sap.ui.model.json.JSONModel(oPath);
                    this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
                    await this.getStagefieldsAPI();

                }
                let oObjectPageLayout = this.byId('CadDetailHeaderObject');
                let oSection = this.byId('CadDetailHeaderSelect');
                oObjectPageLayout.setSelectedSection(oSection);

                const aScrollContainerIds = ['scrollDiaCADDetail', 'scrollCADAttach', 'caddetail_scrollcontainerMain', 'caddetail_scrollcontainerSub', 'caddetail_scrollcontainerChild','scrollCADDetailSeek','caddetail_scrollcontainer-seek'];
                aScrollContainerIds.forEach(id => {
                    const oScrollContainer = this.getView().byId(id); // Get the ScrollContainer by ID
                    if (oScrollContainer) {
                        const oDomRef = oScrollContainer.getDomRef(); // Get the DOM reference of the container
                        if (oDomRef) {
                            // Apply min and max height dynamically to each container
                            oDomRef.style.minHeight = 'auto';
                            oDomRef.style.maxHeight = '300px';
                            oDomRef.style.overflow = 'auto'; // Ensure scrolling
                        }
                    }
                });

            },

            onBeforeShow: async function (oEvent) {


                this.identifyFormMode(oEvent);
                this.initialize();
                this.setEntryFormDataSourceURLForEditMode("/odata/v4/stoneman-crf/TCadDetail(" + this.getListViewEditPropertyValue() + ")?$expand=MerTeamHead,MerTL,MerATL,TechnoUserId,PDCUserId,QualityATLUserId,QualityTLUserId,DesignerUserId,InspDraw($expand=DraftUserID,DraftAttachmentAbsId,InspRefDocAbsId),ApprovalTransaction($expand=UserId),SeekAdvice($expand=UserID,RoleCode,SeekAdviceDocAbsId),Material,MainAssembly($expand=AssemblyCadAttachment),SubAssembly($expand=AssemblyCadAttachment),ChildAssembly($expand=AssemblyCadAttachment)");
                await this.showEntryForm();
                if (this.getFormMode() == "2") {
                    await this.getEditDataCadDetail();

                }

                var sampleData = {
                    "ReqTypArray": [
                        {
                            "id": "N",
                            "name": "New"
                        },
                        {
                            "id": "R",
                            "name": "Repeat"
                        }
                    ],
                    "CRFCATArray": [
                        {
                            "id": "CAD",
                            "name": "CAD"
                        },
                        {
                            "id": "Rendering",
                            "name": "Rendering"
                        }
                    ],

                    "lblType": [
                        {
                            "id": "decor",
                            "name": "Decor"
                        },
                        {
                            "id": "furnishing",
                            "name": "Furniture"
                        }
                    ],
                    "inputTypeArray": [
                        {
                            "id": "INPUT1",
                            "name": "Internal"
                        },
                        {
                            "id": "INPUT2",
                            "name": "External"
                        }
                    ], "processJobWorkRate": [
                        {
                            "id": "EASY",
                            "name": "Easy"

                        }, {
                            "id": "MEDIUM",
                            "name": "Medium"

                        }, {
                            "id": "CRITICAL",
                            "name": "Critical"

                        }
                    ]
                };
                this.createNewModelUsingArray("ReqTypeModel", sampleData);
                this.populateSelect("caddetail_reqType", "ReqTypeModel", "ReqTypArray", "id", "name");

            },

            onNavBack: function () {
                const oHistory = History.getInstance()
                const sPreviousHash = oHistory.getPreviousHash()

                if (sPreviousHash !== undefined) {
                    window.history.go(-1)
                } else {
                    const oRouter = this.getOwnerComponent().getRouter()
                    oRouter.navTo(this.getBackwardRoute(), {}, true)
                }
            },

            getEditDataCadDetail: async function () {
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var aData = oModel.getData();

                aData.Material.forEach(function (item, index = 0) {
                    item.srNo = index + 1;
                })

                aData.InspDraw.forEach(function (item, index = 0) {
                    item.srNo = index + 1;
                    item.isDownloadVisible = true;
                })

                aData.SeekAdvice.forEach(function (item, index = 0) {
                    item.RowNumber = index + 1;
                })

                aData.MainAssembly.forEach(function (element, index) {
                    element.srNo = index + 1;
                    element.isNewRow = false;
                    element.isDownloadVisibleMain = true;
                })
                aData.SubAssembly.forEach(function (element, index) {
                    element.srNo = index + 1;
                    element.isNewRow = false;
                    element.isDownloadVisibleSub = true;
                })
                aData.ChildAssembly.forEach(function (element, index) {
                    element.srNo = index + 1;
                    element.isNewRow = false;
                    element.isDownloadVisibleChild = true;
                })

                aData.ApprovalTransaction.forEach(function (item, index = 0) {
                    item.ProcessDte = item.ProcessDate === null ? null : formatter.getDateFromatIn_ddMMyyyy_HHmm(item.ProcessDate);
                    item.StartDte = item.StartDate === null ? null : formatter.getDateFromatIn_ddMMyyyy_HHmm(item.StartDate);
                    item.EndDte = item.EndDate === null ? null : formatter.getDateFromatIn_ddMMyyyy_HHmm(item.EndDate);
                    item.RowNumber = index + 1;
                })
                this.showHideViewBtn(aData);
                this.getEnableDisableAPIForCadDetails(sstageCode);
                oModel.setData(aData);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

            },

            showHideViewBtn: function (data) {
                data.SeekAdvice.forEach(function (item) {
                    if (item.SeekAdviceDocAbsId_AbsId !== null) {
                        item.isDownloadVisibleSeek = true;
                    } else {
                        item.isDownloadVisibleSeek = false;
                    }
                });
                data.MainAssembly.forEach(function (element) {
                    if (item.AssemblyCadAttachment_AbsId !== null) {
                        element.isDownloadVisibleMain = true;
                    } else {
                        element.isDownloadVisibleMain = false;
                    }

                })
                data.SubAssembly.forEach(function (element) {
                    if (item.AssemblyCadAttachment_AbsId !== null) {
                        element.isDownloadVisibleSub = true;
                    } else {
                        element.isDownloadVisibleSub = false;
                    }

                })
                data.ChildAssembly.forEach(function (element) {
                    if (item.AssemblyCadAttachment_AbsId !== null) {
                        element.isDownloadVisibleChild = true;
                    } else {
                        element.isDownloadVisibleChild = false;
                    }

                })

                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oModel.setData(data);
                this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
            },

            getStagefieldsAPI: async function () {
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MStage?$filter=OrderBy eq 1 and FormType eq 'CAD'", "", "myModel");
                let myModel = this.getView().getModel("myModel").getData();
                let model = this.getView().getModel(this.getEntryFormDataSourceModelName());
                model.setProperty("/CrfStageCode_StageCode_StageConstant", myModel.value[0].StageCode_StageConstant);
                model.setProperty("/CrfStageName", myModel.value[0].StageName);
                model.setProperty("/CreatedByUserID_UserID", loginInfo.UserID);
                sstageCode = this.getView().getModel(this.getEntryFormDataSourceModelName()).getProperty('/CrfStageCode_StageCode_StageConstant');
                this.getEnableDisableAPIForCadDetails(sstageCode);

            },

            getEnableDisableAPIForCadDetails: async function (sstageCode) {

                let editStageCode = this.getView().getModel(this.getEntryFormDataSourceModelName()).getProperty('/CrfStageCode_StageCode_StageConstant');
                var body = {
                    CADGUID: this.getFormMode() === '3' ? null : this.getListViewEditPropertyValue(),
                    LOGINGUID: loginInfo.UserID,
                    ROLECODE: role.RoleCode,
                    STAGECODE: this.getFormMode() === '3' ? sstageCode : editStageCode
                }
                await this.createNewModelUsingAPI("POST", "/odata/v4/stoneman-crf/EnableAndDisableForCAD", body, "enabledisableModel");
                let enabledisableModel = this.getView().getModel("enabledisableModel");
                let datamodel = enabledisableModel.getData();


                if (datamodel) {
                    enableDisableArrayForBtn = [];
                    if (datamodel.value.length != 0) {
                        enableDisableArrayForBtn = datamodel.value
                        this.updateControlStatesForBtn(enableDisableArrayForBtn);
                    }
                }

            },

            updateControlStatesForBtn: function (enableDisableArrayForBtn) {
                var view = this.getView();
                enableDisableArrayForBtn.forEach(function (item) {
                    var control = view.byId(item.CONTROLID);
                    if (control && control.setEnabled) {
                        control.setEnabled(item.ENABLED);
                    }
                });
                this.disableTable('caddetail_matTable', enableDisableArrayForBtn);
                this.disableTable('caddetail_mainAssemblyTable', enableDisableArrayForBtn);
                this.disableTable('caddetail_subAssemblyTable', enableDisableArrayForBtn);
                this.disableTable('caddetail_childAssemblyTable', enableDisableArrayForBtn);
            },

            disableTable: function (tableId, enableDisableArray) {
                var oTable = this.byId(tableId); // Get the table by its ID
                if (oTable) {
                    var aItems = oTable.getItems(); // Get the items (rows) of the table

                    aItems.forEach(function (oItem) {
                        var oCells = oItem.getCells(); // Get the cells (columns) of each row

                        oCells.forEach(function (item) {
                            var sControlId = item.getId();
                            sControlId = sControlId.replace(tableId, ''); // Remove the table ID from the control ID
                            var controlState = enableDisableArray.find(function (controlItem) {
                                return sControlId.includes(controlItem.CONTROLID);
                            });

                            if (controlState && typeof item.setEnabled === 'function') {
                                item.setEnabled(controlState.ENABLED);
                            }
                        });
                    });
                }
            },



            onChangeCADReqNo: async function () {
                if (role.RoleName == "DTP_ASSISTANT") {

                    let model = this.getView().getModel(this.getEntryFormDataSourceModelName());
                    model.setProperty("/DTPAssitantName", loginInfo.Username);
                    model.setProperty("/DTPAssitant_UserID", loginInfo.UserID);
                    this.getView().setModel(model, this.getEntryFormDataSourceModelName());
                }

                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let reqId = y.getProperty("/CrfReqUUID_CrfReqUUID");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/TCrfHeader?$expand=MerTeamHead,MerTL,MerATL,TechnoUserId,PDCUserId,QualityATLUserId,QualityTLUserId,DesignerUserId,Material,InspDraw($expand=DraftUserID,DraftAttachmentAbsId,InspRefDocAbsId)&$filter=CrfReqUUID eq " + reqId, "", "myModel");
                let myModel = this.getView().getModel("myModel");
                let x = this.getView().getModel(this.getEntryFormDataSourceModelName());
                x.setProperty("/CrfReqUUID_CrfReqUUID", myModel.getProperty("/value/0/CrfReqUUID"));
                x.setProperty("/ReqTyp", myModel.getProperty("/value/0/ReqTyp"));
                x.setProperty("/BuyerCode", myModel.getProperty("/value/0/BuyerCode"));
                x.setProperty("/BuyerName", myModel.getProperty("/value/0/BuyerName"));
                x.setProperty("/InputType", myModel.getProperty("/value/0/InputType"));
                x.setProperty("/MerReqDate", myModel.getProperty("/value/0/MerReqDate"));
                x.setProperty("/Category", myModel.getProperty("/value/0/Category"));
                x.setProperty("/ItemCode", myModel.getProperty("/value/0/ItemCode"));
                x.setProperty("/ItemDesc", myModel.getProperty("/value/0/ItemDesc"));
                x.setProperty("/ItemGroup", myModel.getProperty("/value/0/ItemGroup"));
                x.setProperty("/LblTyp", myModel.getProperty("/value/0/LblTyp"));
                x.setProperty("/ECNNo", myModel.getProperty("/value/0/ECNNo"));
                x.setProperty("/CarNo", myModel.getProperty("/value/0/CarNo"));
                x.setProperty("/CRFNo", myModel.getProperty("/value/0/CRFNo"));
                x.setProperty("/Reamrks", myModel.getProperty("/value/0/Reamrks"));
                x.setProperty("/Material", myModel.getProperty("/value/0/Material"));
                x.setProperty("/InspDraw", myModel.getProperty("/value/0/InspDraw"));
                // x.setProperty("/CrfStageCode_StageCode_StageConstant", myModel.getProperty("/value/0/CrfStageCode_StageCode_StageConstant"));
                // x.setProperty("/CrfStageName", myModel.getProperty("/value/0/CrfStageName"));
                x.setProperty("/ApprStatus", "NA");
                x.setProperty("/DesignerUserId_UserID", myModel.getProperty("/value/0/DesignerUserId_UserID"));
                x.setProperty("/MerTeamHead_UserID", myModel.getProperty("/value/0/MerTeamHead_UserID"));
                x.setProperty("/MerTL_UserID", myModel.getProperty("/value/0/MerTL_UserID"));
                x.setProperty("/MerATL_UserID", myModel.getProperty("/value/0/MerATL_UserID"));
                x.setProperty("/PDCUserId_UserID", myModel.getProperty("/value/0/PDCUserId_UserID"));
                x.setProperty("/TechnoUserId_UserID", myModel.getProperty("/value/0/TechnoUserId_UserID"));
                x.setProperty("/QualityTLUserId_UserID", myModel.getProperty("/value/0/QualityTLUserId_UserID"));
                x.setProperty("/QualityATLUserId_UserID", myModel.getProperty("/value/0/QualityATLUserId_UserID"));

                x.setProperty("/MerTeamHead/Username", myModel.getProperty("/value/0/MerTeamHead/Username"));
                x.setProperty("/MerTL/Username", myModel.getProperty("/value/0/MerTL/Username"));
                x.setProperty("/MerATL/Username", myModel.getProperty("/value/0/MerATL/Username"));
                x.setProperty("/TechnoUserId/Username", myModel.getProperty("/value/0/TechnoUserId/Username"));
                x.setProperty("/QualityTLUserId/Username", myModel.getProperty("/value/0/QualityTLUserId/Username"));
                x.setProperty("/QualityATLUserId/Username", myModel.getProperty("/value/0/QualityATLUserId/Username"));
                x.setProperty("/PDCUserId/Username", myModel.getProperty("/value/0/PDCUserId/Username"));

                x.setProperty("/DesignerUserId/Username", myModel.getProperty("/value/0/DesignerUserId/Username"));

                x.setProperty("/CrfDelDate", myModel.getProperty("/value/0/CrfDelDate"));
                x.setProperty("/Length", myModel.getProperty("/value/0/Length"));
                x.setProperty("/TolLength", myModel.getProperty("/value/0/TolLength"));
                x.setProperty("/Width", myModel.getProperty("/value/0/Width"));
                x.setProperty("/TolWidth", myModel.getProperty("/value/0/TolWidth"));
                x.setProperty("/Height", myModel.getProperty("/value/0/Height"));
                x.setProperty("/TolHeight", myModel.getProperty("/value/0/TolHeight"));
                x.setProperty("/UnitCode", myModel.getProperty("/value/0/UnitCode"));
                x.setProperty("/UnitName", myModel.getProperty("/value/0/UnitName"));
                x.setProperty("/DiaTop", myModel.getProperty("/value/0/DiaTop"));
                x.setProperty("/TolHeight", myModel.getProperty("/value/0/TolHeight"));
                x.setProperty("/TolDiaTop", myModel.getProperty("/value/0/TolDiaTop"));
                x.setProperty("/DiaLeft", myModel.getProperty("/value/0/DiaLeft"));
                x.setProperty("/TolDiaLeft", myModel.getProperty("/value/0/TolDiaLeft"));
                x.setProperty("/DiaRight", myModel.getProperty("/value/0/DiaRight"));
                x.setProperty("/TolDiaRight", myModel.getProperty("/value/0/TolDiaRight"));
                x.setProperty("/DiaBottom", myModel.getProperty("/value/0/DiaBottom"));
                x.setProperty("/TolDiaBottom", myModel.getProperty("/value/0/TolDiaBottom"));
                x.setProperty("/CrfCategory", myModel.getProperty("/value/0/CrfCategory"));
                this.onSelectCADNoSetAssemblyNo(myModel.getData().value[0]);
            },

            onSelectCADNoSetAssemblyNo: function (aData) {
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var oData = oModel.getData();
                oData.MainAssembly.forEach(function (item) {
                    item.AssemblyCadNo = (aData.Category === null ? '' : aData.Category) + ' ' + (aData.ItemCode === null ? '' : aData.ItemCode);
                    item.AssemblyCadName = aData.ItemDesc;
                })
                oData.SubAssembly.forEach(function (item) {
                    item.AssemblyCADNo = (aData.Category === null ? '' : aData.Category) + ' ' + (aData.ItemCode === null ? '' : aData.ItemCode);
                    item.AssemblyCadName = aData.ItemDesc;
                })
                oData.ChildAssembly.forEach(function (item) {
                    item.AssemblyCadNo = (aData.Category === null ? '' : aData.Category) + ' ' + (aData.ItemCode === null ? '' : aData.ItemCode);
                    item.AssemblyCadName = aData.ItemDesc;
                })
                oModel.setData(oData);
            },
            onCheckDiamension: function (oEvent) {
                oSelectDiamension = oEvent.getParameter("selected");
                var oViewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oViewModel.setProperty("/isDiamension", oSelectDiamension);
            },

            onCheckDiameter: function (oEvent) {
                oSelectDiameter = oEvent.getParameter("selected");
                var oViewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oViewModel.setProperty("/isDiaMeter", oSelectDiameter);
            },

            cflforOldReqNo: async function () {
                this.setCflTitle("CAD Request No List");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/TCadDetail?$orderby=CrfReqNo desc", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["CadDetailNo", "CadDetailUUID"]);
                this.setCflDataColumns(["CadDetailNo", "CadDetailUUID"]);
                this.setCflValueAndDisplay("", "", "cadReqNo", "CadDetailNo");
                this.setCflSearchProperty("CadDetailNo");
                this.showCfl("caddetail_cadReqNo", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForOldcrf.bind(this));
            },
            onClosecflForCADDetailNo: function () {
                let object = this.getCflObject();
                let model = this.getView().getModel(this.getEntryFormDataSourceModelName());

                model.setProperty("/CrfReqUUID_CrfReqUUID", object.CrfReqUUID);
                this.onChangeCADReqNo();
            },
            cflforCADNo: async function () {
                this.setCflTitle("CAD Request No List");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/TCrfHeader?$filter=CrfStatus eq 'CLS' and CrfCategory eq 'CAD'&$orderby=CrfReqNo desc", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["CrfReqNo", "CrfReqUUID"]);
                this.setCflDataColumns(["CrfReqNo", "CrfReqUUID"]);
                this.setCflValueAndDisplay("/CrfReqNo", "CrfReqNo", "", "");
                this.setCflSearchProperty("CrfReqNo");
                this.showCfl("caddetail_cadReqNo", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADDetailNo.bind(this));
            },
            cflForMaterialCategory: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Material Category List");
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_EXTPRODGRP_CDS/YY1_ExtProdGrp", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["ExternalProductGroup", "ExternalProductGroupName"]);
                this.setCflDataColumns(["ExternalProductGroup", "ExternalProductGroupName"]);
                this.setCflValueAndDisplay(`/Material/${rowIndex}/MaterialCatHanaText`, "ExternalProductGroupName", "", "");
                this.setCflSearchProperty("ExternalProductGroupName");
                this.showCfl("caddetail_materialCategory", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforMaterialCategory.bind(this), this.onCancelforMaterialCategory.bind(this));

            },

            onConfirmforMaterialCategory: function () {

            },
            onCancelforMaterialCategory: function () {

            },
            cflForDeptSeek: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Department List");
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata4/sap/api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2?$top=1000", "", this.getCflListViewDataSourceModelName());
                this.setCflListViewDataSourceProperties("GET", "/sap/opu/odata4/sap/api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2?$top=1000", "", "value");
                this.setCflDisplayColumns(["CostCenter", "CostCenterName", "CostCenterDescription"]);
                this.setCflDataColumns(["CostCenter", "CostCenterName", "CostCenterDescription"]);
                this.setCflValueAndDisplay(`/SeekAdvice/${rowIndex}/DepartmentCode`, "CostCenter", "", "");
                this.setCflSearchProperty("CostCenter");
                this.showCfl("caddetail_dept", this.getCflListViewDataSourceModelName(), "value", this.onConfirmforDeptSeek.bind(this), this.onCancelforDeptSeek.bind(this));

            },

            onConfirmforDeptSeek: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/SeekAdvice/${irowIndex}/DepartmentName`, x.CostCenterName);
            },
            onCancelforDeptSeek: function () {

            },
            cflForUserSeek: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("User List");
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let costcenter = y.getProperty(`/SeekAdvice/${rowIndex}/DepartmentCode`);
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MUser" + "?$filter=DepartmentCode eq '" + costcenter + "'&$expand=UserRoleCode", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["Username", "Usercode"]);
                this.setCflDataColumns(["Username", "Usercode"]);
                this.setCflValueAndDisplay(`/SeekAdvice/${rowIndex}/UserID/Username`, "Username", "", "");
                this.setCflSearchProperty("Username");
                this.showCfl("caddetail_user", this.getCflListViewDataSourceModelName(), "value", this.onConfirmforUserSeek.bind(this), this.onCancelforUserSeek.bind(this));

            },
            onConfirmforUserSeek: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/SeekAdvice/${irowIndex}/UserID_UserID`, x.UserID);
                y.setProperty(`/SeekAdvice/${irowIndex}/RoleCode_RoleCode_RoleConstant`, x.UserRoleCode_RoleCode_RoleConstant);
                y.setProperty(`/SeekAdvice/${irowIndex}/roleName`, x.UserRoleCode.RoleName);
            },
            onCancelforUserSeek: function () {

            },
            cflForUOM: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("UOM List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["UnitOfMeasure"]);
                this.setCflDataColumns(["UnitOfMeasure"]);
                this.setCflValueAndDisplay(`/MainAssembly/${rowIndex}/UOMCode`, "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasure");
                this.showCfl("caddetail_uom", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforUOM.bind(this), this.onCancelforUOM.bind(this));


            },
            onConfirmforUOM: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/MainAssembly/${irowIndex}/UOMName`, x.UnitOfMeasureLongName);

            },
            onCancelforUOM: function () {

            },
            cflForUoMDimension: async function () {

                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());
                this.setCflTitle("UOM List");
                this.setCflDisplayColumns(["Unit Of Measure", "Unit Of Measure Name"]);
                this.setCflDataColumns(["UnitOfMeasure", "UnitOfMeasureLongName"]);
                this.setCflValueAndDisplay("/UnitCode", "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasureLongName");
                this.showCfl("caddetail_dUnit", this.getCflListViewDataSourceModelName(), "d/results", this.onClosecflForUoMDimension.bind(this));

            },


            onClosecflForUoMDimension: function () {

                let oUoMRes = this.getCflObject();
                let oUoMResSetData = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oUoMResSetData.setProperty("/UnitName", oUoMRes.UnitOfMeasureLongName);
            },

            cflForUOMSubAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("UOM List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["UnitOfMeasure"]);
                this.setCflDataColumns(["UnitOfMeasure"]);
                this.setCflValueAndDisplay(`/SubAssembly/${rowIndex}/UOMCode`, "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasure");
                this.showCfl("caddetail_subUOM", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforUOMSubAssembly.bind(this), this.onCancelforUOMSubAssembly.bind(this));


            },
            onConfirmforUOMSubAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/SubAssembly/${irowIndex}/UOMName`, x.UnitOfMeasureLongName);

            },
            onCancelforUOMSubAssembly: function () {

            },
            cflForUOMChildAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("UOM List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["UnitOfMeasure"]);
                this.setCflDataColumns(["UnitOfMeasure"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/UOMCode`, "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasure");
                this.showCfl("caddetail_childUOM", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforUOMChildAssembly.bind(this), this.onCancelforUOMChildAssembly.bind(this));


            },
            onConfirmforUOMChildAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/ChildAssembly/${irowIndex}/UOMName`, x.UnitOfMeasureLongName);

            },
            onCancelforUOMChildAssembly: function () {

            },
            cflForUOMChildAssemblyNetWeight: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("UOM List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["UnitOfMeasure"]);
                this.setCflDataColumns(["UnitOfMeasure"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/NetWeightUOM`, "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasure");
                this.showCfl("caddetail_childWeightUOM", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforUOMChildAssemblyNetWeight.bind(this), this.onCancelforUOMChildAssemblyNetWeight.bind(this));


            },
            onConfirmforUOMChildAssemblyNetWeight: function () {
                let x = this.getCflObject();
                // let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // y.setProperty(`/ChildAssembly/${irowIndex}/UOMName`, x.UnitOfMeasureLongName);

            },
            onCancelforUOMChildAssemblyNetWeight: function () {

            },
            cflForUOMChildAssemblyGrossQty: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("UOM List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_UNITOFMEASURE_CDS/YY1_UnitOfMeasure", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["UnitOfMeasure"]);
                this.setCflDataColumns(["UnitOfMeasure"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/GrossQtyUOM`, "UnitOfMeasure", "", "");
                this.setCflSearchProperty("UnitOfMeasure");
                this.showCfl("caddetail_childGrossQtyUOM", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforUOMChildAssemblyGrossQty.bind(this), this.onCancelforUOMChildAssemblyGrossQty.bind(this));


            },
            onConfirmforUOMChildAssemblyGrossQty: function () {
                let x = this.getCflObject();
                // let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // y.setProperty(`/ChildAssembly/${irowIndex}/UOMName`, x.UnitOfMeasureLongName);

            },
            onCancelforUOMChildAssemblyGrossQty: function () {

            },
            cflForProductNo: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Product List");

                //  await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["Product", "ProductDescription"]);
                this.setCflDataColumns(["Product", "ProductDescription"]);
                this.setCflValueAndDisplay(`/MainAssembly/${rowIndex}/ProductNo`, "Product", "", "");
                this.setCflSearchProperty("Product");
                this.showCfl("caddetail_productNo", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforProductNo.bind(this), this.onCancelforProductNo.bind(this));


            },
            onConfirmforProductNo: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/MainAssembly/${irowIndex}/ProductName`, x.ProductDescription);

            },
            onCancelforProductNo: function () {

            },
            cflForProductNoSubAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Product List");

                //   await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["Product", "ProductDescription"]);
                this.setCflDataColumns(["Product", "ProductDescription"]);
                this.setCflValueAndDisplay(`/SubAssembly/${rowIndex}/ProductNo`, "Product", "", "");
                this.setCflSearchProperty("Product");
                this.showCfl("caddetail_subProductNo", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforProductNoSubAssembly.bind(this), this.onCancelforProductNoSubAssembly.bind(this));


            },
            onConfirmforProductNoSubAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/SubAssembly/${irowIndex}/ProductName`, x.ProductDescription);

            },
            onCancelforProductNoSubAssembly: function () {

            },
            cflForProductNoChildAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Product List");

                // await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product" + "?$expand=to_Description", "", this.getCflListViewDataSourceModelName());
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API", "", this.getCflListViewDataSourceModelName());

                this.setCflDisplayColumns(["Product", "ProductDescription"]);
                this.setCflDataColumns(["Product", "ProductDescription"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/ProductNo`, "Product", "", "");
                this.setCflSearchProperty("Product");
                this.showCfl("caddetail_childProductNo", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforProductNoChildAssembly.bind(this), this.onCancelforProductNoChildAssembly.bind(this));


            },
            onConfirmforProductNoChildAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/ChildAssembly/${irowIndex}/ProductName`, x.ProductDescription);
                y.setProperty(`/ChildAssembly/${irowIndex}/MaterialCategoryCode`, x.ProductType);

            },
            onCancelforProductNoChildAssembly: function () {

            },

            cflForManufacturingProcess: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                irowIndex = rowIndex;
                this.setCflTitle("Manufacturing Process List");

                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_MANUFACTURINGANDOPERAT?$select=SAP_UUID,ManufacturingProcessCode,ManufacturingProcessName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflDataColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflValueAndDisplay(`/MainAssembly/${rowIndex}/ManufacturingName`, "ManufacturingProcessName", "", "");
                this.setCflSearchProperty("ManufacturingProcessName");
                this.showCfl("caddetail_mfgprocess", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforMfgProcess.bind(this), this.onCancelforMfgProcess.bind(this));


            },
            onConfirmforMfgProcess: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/MainAssembly/${irowIndex}/ManufacturingProcessID`, x.SAP_UUID);
                y.setProperty(`/MainAssembly/${irowIndex}/ManufacturingCode`, x.ManufacturingProcessCode);
                //    y.setProperty(`/MainAssembly/${irowIndex}/SAP_UUID`, x.SAP_UUID);

            },
            onCancelforMfgProcess: function () {

            },
            cflForManufacturingProcessSubAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                this.setCflTitle("Manufacturing Process List");

                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_MANUFACTURINGANDOPERAT?$select=SAP_UUID,ManufacturingProcessCode,ManufacturingProcessName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflDataColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflValueAndDisplay(`/SubAssembly/${rowIndex}/ManufacturingName`, "ManufacturingProcessName", "", "");
                this.setCflSearchProperty("ManufacturingProcessName");
                this.showCfl("subMfgprocess", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforMfgProcessSubAssembly.bind(this), this.onCancelforMfgProcessSubAssembly.bind(this));


            },
            onConfirmforMfgProcessSubAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/SubAssembly/${irowIndex}/ManufacturingProcessID`, x.SAP_UUID);
                y.setProperty(`/SubAssembly/${irowIndex}/ManufacturingCode`, x.ManufacturingProcessCode);
                //    y.setProperty(`/SubAssembly/${irowIndex}/SAP_UUID`, x.SAP_UUID);
            },
            onCancelforMfgProcessSubAssembly: function () {

            },
            cflForManufacturingProcessChildAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();

                // rowIndex = oEvent.getParent().getBindingContext().rowIndex;

                irowIndex = rowIndex;

                this.setCflTitle("Manufacturing Process List");

                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_MANUFACTURINGANDOPERAT?$select=SAP_UUID,ManufacturingProcessCode,ManufacturingProcessName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflDataColumns(["ManufacturingProcessCode", "ManufacturingProcessName", "SAP_UUID"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/ManufacturingName`, "ManufacturingProcessName", "", "");
                this.setCflSearchProperty("ManufacturingProcessName");
                this.showCfl("caddetail_childMfgprocess", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforMfgProcessChildAssembly.bind(this), this.onCancelforMfgProcessChildAssembly.bind(this));


            },
            onConfirmforMfgProcessChildAssembly: function () {

                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/ChildAssembly/${irowIndex}/ManufacturingProcessID`, x.SAP_UUID);
                y.setProperty(`/ChildAssembly/${irowIndex}/ManufacturingCode`, x.ManufacturingProcessCode);
                //  y.setProperty(`/ChildAssembly/${irowIndex}/SAP_UUID`, x.SAP_UUID);
            },
            onCancelforMfgProcessChildAssembly: function () {

            },
            cflForOperation: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                this.setCflTitle("Operation Symbols List");
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let data = y.getProperty(`/MainAssembly/${rowIndex}/ManufacturingProcessID`);
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_OPERATION_MANUFACTURINGAND" + "? $filter=SAP_PARENT_UUID eq '" + data + "'&$select=SAP_UUID,SAP_PARENT_UUID,OperationNamewithSymbolsCode,OperationNamewithSymbolsName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflDataColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflValueAndDisplay(`/MainAssembly/${rowIndex}/OperationProcessName`, "OperationNamewithSymbolsName", "", "");
                this.setCflSearchProperty("OperationNamewithSymbolsName");
                this.showCfl("caddetail_opesymbol", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforOperation.bind(this), this.onCancelforOperation.bind(this));

            },
            onConfirmforOperation: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                // y.setProperty(`/MainAssembly/${irowIndex}/OperationNameWithSymbols_id`, x.SAP_UUID);
                y.setProperty(`/MainAssembly/${irowIndex}/OperationProcessCode`, x.OperationNamewithSymbolsCode);


            },
            onCancelforOperation: function () {

            },
            cflForOperationSubAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                this.setCflTitle("Operation Symbols List");
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let data = y.getProperty(`/SubAssembly/${rowIndex}/ManufacturingProcessID`);
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_OPERATION_MANUFACTURINGAND" + "? $filter=SAP_PARENT_UUID eq '" + data + "'&$select=SAP_UUID,SAP_PARENT_UUID,OperationNamewithSymbolsCode,OperationNamewithSymbolsName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflDataColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflValueAndDisplay(`/SubAssembly/${rowIndex}/OperationProcessName`, "OperationNamewithSymbolsName", "", "");
                this.setCflSearchProperty("OperationNamewithSymbolsName");
                this.showCfl("caddetail_subOpesymbol", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforOperationSubAssembly.bind(this), this.onCancelforOperationSubAssembly.bind(this));

            },
            onConfirmforOperationSubAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                //   y.setProperty(`/SubAssembly/${irowIndex}/OperationNameWithSymbols_id`, x.SAP_UUID);
                y.setProperty(`/SubAssembly/${irowIndex}/OperationProcessCode`, x.OperationNamewithSymbolsCode);

            },
            onCancelforOperationSubAssembly: function () {

            },
            cflForOperationChildAssembly: async function (oEvent) {
                var oSource = oEvent.getSource();

                // Get the binding context of the source control to access the row index
                var oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());

                // Retrieve the row index from the context
                var rowIndex = oContext.getPath().split("/").pop();
                this.setCflTitle("Operation Symbols List");
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let data = y.getProperty(`/ChildAssembly/${rowIndex}/ManufacturingProcessID`);
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/YY1_MANUFACTURINGANDOPERAT_CDS/YY1_OPERATION_MANUFACTURINGAND" + "? $filter=SAP_PARENT_UUID eq '" + data + "'&$select=SAP_UUID,SAP_PARENT_UUID,OperationNamewithSymbolsCode,OperationNamewithSymbolsName", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflDataColumns(["OperationNamewithSymbolsCode", "OperationNamewithSymbolsName", "SAP_UUID", "SAP_PARENT_UUID"]);
                this.setCflValueAndDisplay(`/ChildAssembly/${rowIndex}/OperationProcessName`, "OperationNamewithSymbolsName", "", "");
                this.setCflSearchProperty("OperationNamewithSymbolsName");
                this.showCfl("caddetail_childOpesymbol", this.getCflListViewDataSourceModelName(), "d/results", this.onConfirmforOperationChildAssembly.bind(this), this.onCancelforOperationChildAssembly.bind(this));

            },
            onConfirmforOperationChildAssembly: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                //    y.setProperty(`/ChildAssembly/${irowIndex}/OperationNameWithSymbols_id`, x.SAP_UUID);
                y.setProperty(`/ChildAssembly/${irowIndex}/OperationProcessCode`, x.OperationNamewithSymbolsCode);


            },
            onCancelforOperationChildAssembly: function () {

            },
            CFLforDTPHead: async function () {
                this.setCflTitle("DTP Head List");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MUser?$filter=UserRoleCode_RoleCode_RoleConstant eq 'DTP_HEAD'", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["Username", "UserID"]);
                this.setCflDataColumns(["Username", "UserID"]);
                this.setCflValueAndDisplay("/DTPHeadName", "Username", "", "");
                this.setCflSearchProperty("Username");
                this.showCfl("caddetail_caddetailefdtpheadname", this.getCflListViewDataSourceModelName(), "value", this.onConfirmForDTPHead.bind(this), this.onCancelForDTPHead.bind(this));
            },
            onConfirmForDTPHead: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
                y.setProperty(`/DTPHead_UserID`, x.UserID);

            },
            onCancelForDTPHead: function () {
                let x = this.getCflObject();
            },
            validateFields: function () {
                let isValid = true;
                let isValidMainAssembly = true;
                let isValidChildAssembly = true;
                let isValidSubAssembly = true;
                let isValidSeekAdvice = true;
                let oData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                let MainAssembly = oData.MainAssembly;
                let ChildAssembly = oData.ChildAssembly;
                let SubAssembly = oData.SubAssembly;
                let SeekAdvice = oData.SeekAdvice;
                if (oData.CrfReqNo == null || oData.CrfReqNo == "") {
                    MessageToast.show("Please select CAD Request No.");
                    isValid = false;
                }
                else if (oData.DTPHeadName == "" || oData.DTPHeadName == null || oData.DTPHeadName == undefined || oData.DTPHead_UserID == "") {
                    MessageToast.show("Please Enter DTP Head");
                    isValid = false;
                }
                if (oData.SeasonProgram == "" || oData.SeasonProgram == null) {
                    isValid = false;
                    MessageToast.show("Please Enter Season/Program field");
                }
                if (oData.CrfReqNo == "") {
                    isValid = false;
                    MessageToast.show("Please Enter Mandatory field");
                }
                if (oSelectDiamension && (oData.Length === '' || oData.TolLength === '' || oData.Width === '' || oData.TolWidth === '' || oData.Height === '' || oData.TolHeight === '')) {
                    isValid = false;
                    MessageToast.show("Please Enter Mandatory field");
                }
                if ((oSelectDiamension === undefined || oSelectDiamension === false) && (oData.Length === '' || oData.TolLength === '' || oData.Width === '' || oData.TolWidth === '' || oData.Height === '' || oData.TolHeight === '')) {
                    isValid = false;
                    MessageToast.show("Please Enter at least 0");
                }
                if (oSelectDiameter && (oData.DiaTop === '' || oData.TolDiaTop === '' || oData.DiaLeft === '' || oData.TolDiaLeft === '' || oData.DiaRight === '' || oData.TolDiaRight === '' || oData.DiaBottom === '')) {
                    isValid = false;
                    MessageToast.show("Please Enter Mandatory field");
                }
                if ((oSelectDiameter === undefined || oSelectDiameter === false) && (oData.DiaTop === '' || oData.TolDiaTop === '' || oData.DiaLeft === '' || oData.TolDiaLeft === '' || oData.DiaRight === '' || oData.TolDiaRight === '' || oData.DiaBottom === '')) {
                    isValid = false;
                    MessageToast.show("Please Enter at least 0");
                }

                for (let index = 0; index < MainAssembly.length; index++) {
                    const item = MainAssembly[index];
                    if (this.isEmpty(item.AssemblyCadNo)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Assembly CAD No in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.AssemblyCadNo)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Assembly CAD No in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.AssemblyCadName)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter AssemblyCadName in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductNo)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Product No in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductName)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Product Name in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ManufacturingName)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter ManufacturingProcess in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.OperationProcessName)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter OperationNameWithSymbols in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.LengthUOM)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Length in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolLengthUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Tol Length in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.WidthUOM)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Width in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWidthUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Tol Width in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.HeightUOM)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Height in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolHeightUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Tol Height in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.DiameterUOM)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Diameter in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolDiameterUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Tol Diameter in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.WeightUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Weight in Main Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWeightUom)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Tol Weight in Main Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.Finish)) {
                        isValidMainAssembly = false;
                        MessageToast.show("Please Enter Finish in Main Assembly at row " + (index + 1));
                        break;
                    }
                }
                for (let index = 0; index < SubAssembly.length; index++) {
                    const item = SubAssembly[index];
                    if (this.isEmpty(item.AssemblyCADNo)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Assembly CAD No in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.AssemblyCadName)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Assembly Cad Name in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductNo)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Product No in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductName)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Product Name in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ManufacturingName)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter ManufacturingProcess in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.OperationProcessName)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter OperationNameWithSymbols in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.LengthUOM)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Length in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolLengthUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Tol Length in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.WidthUOM)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Width in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWidthUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Tol Width in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.HeightUOM)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Height in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolHeightUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Tol Height in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.DiameterUOM)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Diameter in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolDiameterUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Tol Diameter in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.WeightUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Weight in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWeightUom)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Tol Weight in Sub Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.SubAssemblyName)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter SubAssemblyName in Sub Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.Finish)) {
                        isValidSubAssembly = false;
                        MessageToast.show("Please Enter Finish in Sub Assembly at row " + (index + 1));
                        break;
                    }
                }
                for (let index = 0; index < ChildAssembly.length; index++) {
                    const item = ChildAssembly[index];
                    if (this.isEmpty(item.ChildAssemblyName)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter ChildAssembly Name in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.AssemblyCadNo)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Assembly CAD No in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.AssemblyCadName)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Assembly Cad Name in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductNo)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Product No in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ProductName)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Product Name in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.ManufacturingName)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Manufacturing Process in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.OperationProcessName)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Operation Name With Symbols in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.LengthUOM)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Length in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolLengthUom)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Tol Length in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.WidthUOM)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Width in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWidthUom)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Tol Width in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.HeightUOM)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Height in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolHeightUom)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Tol Height in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.DiameterUOM)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Diameter in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolDiameterUom)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Tol Diameter in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.NetWeightUOM)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Weight in Child Assembly at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.TolWeightUom)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Tol Weight in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.ProcessJobworkRate)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Select Process Jobwork Rate in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.NetWeight)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Weight in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.GrossWeight)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Gross Weight in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.GrossQty)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Gross Qty in Child Assembly at row " + (index + 1));
                        break;
                    }
                    // else if (this.isEmpty(item.GrossQtyUOM)) {
                    //     isValidChildAssembly = false;
                    //     MessageToast.show("Please Enter Gross Qty UOM in Child Assembly at row " + (index + 1));
                    //     break;
                    // }
                    else if (this.isEmpty(item.SpecificationDRGSize)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Specification /DRG size in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.Density)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Density in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.SurfaceArea)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Surface Area in Child Assembly at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.Finish)) {
                        isValidChildAssembly = false;
                        MessageToast.show("Please Enter Finish in Child Assembly at row " + (index + 1));
                        break;
                    }


                }

                for (let index = 0; index < SeekAdvice.length; index++) {
                    const item = SeekAdvice[index];
                    if (this.isEmpty(item.DepartmentName)) {
                        isValidSeekAdvice = false;
                        MessageToast.show("Please Enter Department Name in Seek Advice at row " + (index + 1));
                        break;
                    } else if (this.isEmpty(item.UserID.Username)) {
                        isValidSeekAdvice = false;
                        MessageToast.show("Please Enter Username in Seek Advice at row " + (index + 1));
                        break;
                    }
                    else if (this.isEmpty(item.Question)) {
                        isValidSeekAdvice = false;
                        MessageToast.show("Please Enter  in Seek Advice at row " + (index + 1));
                        break;
                    }
                }

                return isValid && isValidMainAssembly && isValidSubAssembly && isValidChildAssembly && isValidSeekAdvice;
            },
            isEmpty: function (value) {
                return value === null || value === undefined || value === "";
            },
            onSave: function (oEvent) {
                let saveorsubmit = null;
                //   if (this.validateFields()) {
                if (oEvent) {
                    var oButton = oEvent.getSource();
                    // Check the ID or any other attribute of the button to identify it
                    var sButtonId = oButton.getId();

                    var sButtonBaseId = sButtonId.split("--").pop();
                    if (sButtonBaseId === "caddetail_btnSave") {
                        // Logic for Save button
                        saveorsubmit = "SAVE";
                        console.log("Save button pressed");
                    } else if (sButtonBaseId === "caddetail_btnSubmit") {
                        // Logic for Submit button
                        saveorsubmit = "SUBMIT";
                        if (this.validateFields() == false) {
                            return;
                        }
                        console.log("Submit button pressed");
                    }
                    // else if(sButtonBaseId === "CAD_btnApprove") {
                    //     // Logic for Submit button
                    //     saveorsubmit = "SUBMIT";
                    //     console.log("Submit button pressed");
                    // }
                    // else if(sButtonBaseId === "CAD_btnReject") {
                    //     // Logic for Submit button
                    //     saveorsubmit = "SUBMIT";
                    //     console.log("Submit button pressed");
                    // }
                }
                else if (oEvent == undefined) {
                    saveorsubmit = "SUBMIT";
                }
                this.onUploadPress(saveorsubmit);
                // this.onPressOfEntryFormSaveButton();
                //  }
            },
            onRaiseQueryPress: function () {
                var newRow = {
                    isDownloadVisibleSeek: false,
                    isNewRow: true,
                    DepartmentName: null,
                    SeekAdviceDocAbsId_AbsId: null,
                    UserID_UserID: null,
                    UserID: {
                        Username: null
                    },
                    Question: null,
                    Answer: null,
                    SeekAdviceDocAbsId: null,
                    RowNumber: 0,
                    CadDetailID_CadDetailUUID: null
                };

                let model = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let data = model.getData();
                this.addRowToModelArray(this.getEntryFormDataSourceModelName(), "SeekAdvice", newRow);
            },
            addChildRow: function () {

                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var data = oModel.getData();
                var rowLen = data.ChildAssembly.length;
                var childAssemblyNo = data.ChildAssembly[0].AssemblyCadNo;
                var childAssemblyName = data.ChildAssembly[0].AssemblyCadName;
                var newRow = {
                    "isNewRow": null,
                    "isDownloadVisibleChild": null,
                    "AssemblyCadAttachment": null,
                    "MaterialCategoryCode": null,
                    "RowNumber": null,
                    "AssemblyCadNo": childAssemblyNo,
                    "AssemblyCadName": childAssemblyName,
                    "ChildAssemblyName": null,
                    "AssemblyCadAttachment_AbsId": null,
                    "ProductNo": null,
                    "ProductName": null,
                    "LengthUOM": null,
                    "TolLengthUom": null,
                    "WidthUOM": null,
                    "TolWidthUom": null,
                    "HeightUOM": null,
                    "TolHeightUom": null,
                    "DiameterUOM": null,
                    "TolDiameterUom": null,
                    "TolWeightUom": null,
                    "SpecificationDRGSize": null,
                    "TolSpecificationDRGSize": null,
                    "Finish": null,
                    "TCadDetailID_CadDetailUUID": null,
                    "Remarks": null,
                    "ManufacturingName": null,
                    "ManufacturingProcessID": null,
                    "ManufacturingCode": null,
                    "OperationProcessName": null,
                    "OperationProcessCode": null,
                    "Density": null,
                    "SurfaceArea": null,
                    "Micron": null,
                    "DFT": null,
                    "ProcessTime": null,
                    "WastagePer": null,
                    "ProcessJobworkRate": null,
                    "NetWeight": null,
                    "NetWeightUOM": null,
                    "GrossWeight": null,
                    "GrossQty": null,
                    "GrossQtyUOM": null,
                    "FinishDimen": null,
                    "UOMCode": null,
                    "UOMName": null,
                    "isDownloadVisibleChild": false
                };
                this.addRowToModelArray(this.getEntryFormDataSourceModelName(), "ChildAssembly", newRow);
            },
            addSubAssmblyRow: function () {
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var data = oModel.getData();
                var rowLen = data.SubAssembly.length;
                var subAssemblyNo = data.SubAssembly[0].AssemblyCADNo;
                var subAssemblyName = data.SubAssembly[0].AssemblyCadName;
                var newRow = {
                    "isNewRow": null,
                    "isDownloadVisibleSub": null,
                    "AssemblyCadAttachment": null,
                    "srNo": 1,
                    "SubAssembly": null,
                    "AssemblyCADNo": subAssemblyNo,
                    "AssemblyCadName": subAssemblyName,
                    "SubAssemblyName": null,
                    "AssemblyCadAttachment_AbsId": null,
                    "ProductNo": null,
                    "ProductName": null,
                    "ManufacturingProcessID": null,
                    "ManufacturingCode": null,
                    "ManufacturingName": null,
                    "OperationNameWithSymbolsID": null,
                    "OperationProcessCode": null,
                    "OperationProcessName": null,
                    "SAP_UUID": null,
                    "OperationNameWithSymbols_id": null,
                    "LengthUOM": null,
                    "TolLengthUom": null,
                    "WidthUOM": null,
                    "TolWidthUom": null,
                    "HeightUOM": null,
                    "TolHeightUom": null,
                    "DiameterUOM": null,
                    "TolDiameterUom": null,
                    "WeightUom": null,
                    "TolWeightUom": null,
                    "SpecificationDRGSize": null,
                    "TolSpecificationDRGSize": null,
                    "Finish": null,
                    "TCadDetailID_CadDetailUUID": null,
                    "Remarks": null,
                    "RowNumber": null,
                    "isDownloadVisibleSub": false
                };
                this.addRowToModelArray(this.getEntryFormDataSourceModelName(), "SubAssembly", newRow);

            }, onDeleteSeekAdvice: function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(this.getEntryFormDataSourceModelName(), "SeekAdvice", iIndex)
            },
            onDeleteChild: function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(this.getEntryFormDataSourceModelName(), "ChildAssembly", iIndex)
            },
            onDeleteSubAssmbly: function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(this.getEntryFormDataSourceModelName(), "SubAssembly", iIndex)
            },

            onDeleteMaterial: function (oEvent) {

                var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
                this.deleteRow(this.getEntryFormDataSourceModelName(), "Material", iIndex);

            },
            addMaterialRow: function () {

                var newRow = {
                    "MaterialAutoCode": "Material 1",
                    "MaterialCatHanaText": null,
                    "MaterialCatFreeText": null,
                    "Remarks": null,
                    "RowNumber": 1
                };
                this.addRowToModelArray(this.getEntryFormDataSourceModelName(), "Material", newRow);


            },

            addRowToModelArray: function (modelName, arrayName, newRow) {
                // Get the view's model
                let model = this.getView().getModel(modelName);

                // Get the data from the model
                let data = model.getData();

                // Check if the specified array exists in the data
                if (Array.isArray(data[arrayName])) {
                    let rowLen = data[arrayName].length; // Get the length of the array

                    // Increment the srNo property based on the current length
                    newRow.RowNumber = rowLen > 0 ? rowLen + 1 : 1;
                    if (arrayName == "Material") { newRow.MaterialAutoCode = "Material " + (rowLen + 1); }
                    // Add the new row to the specified array
                    data[arrayName].push(newRow);

                    // Set the updated data back to the model
                    model.setData(data);

                    // Update the view with the model (if necessary)
                    this.getView().setModel(modelName, model);
                } else {
                    console.error(`Array ${arrayName} does not exist in the model data.`);
                }
            },
            openDialog: function (oEvent) {
                var oView = this.getView();
                var oSelectedRowContext = oEvent.getSource().getBindingContext(this.getEntryFormDataSourceModelName()); // Get the selected row context

                // Retrieve the data from the selected row
                var oModel = oSelectedRowContext.getModel();
                var sPath = oSelectedRowContext.getPath();
                var oSelectedData = oModel.getProperty(sPath);
                var dialog = new SeekAdviceCommentDialog(oView, "Query", "Query", this);
                //dialog.open();
                var oEventSource = oEvent.getSource();
                var oTableRow = oEventSource.getParent();
                var oTable = oTableRow.getParent();
                var iRowIndex = oTable.indexOfItem(oTableRow);
                console.log("Row Index:", iRowIndex);

                this._iRowIndex = iRowIndex;
                this._oSelectedRowContext = oSelectedRowContext;
                dialog.open(oSelectedRowContext, oSelectedData);
            },
            handleFragmentSelection: function (sReplyValue) {
                let oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oModel.setProperty(this._oSelectedRowContext.getPath() + "/Answer", sReplyValue);

            },
            openDialogApprove: function (oEvent) {
                var oView = this.getView();
                var oModelData = oView.getModel(this.getEntryFormDataSourceModelName()).getData();
                var dialog = new ApproveRejectFragment(oView, "Comment", "APPROVED", this, oModelData);
                dialog.open();
            },
            openDialogReject: function (oEvent) {
                var oView = this.getView();
                var oModelData = oView.getModel(this.getEntryFormDataSourceModelName()).getData();
                var dialog = new ApproveRejectFragment(oView, "Comment", "REJECTED", this, oModelData);
                dialog.open();
            },
            handleFragmentSelectionApproveReject: function (sReplyValue) {

                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oModel.setProperty("/Answer", sReplyValue);

            },
            getApproveRejectComment: function (sReplyValue) {
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                oModel.setProperty("/newApprovalComment", sReplyValue.Comment);
                oModel.setProperty("/newApprovalStatus", sReplyValue.Status);
                this.onSave();


            },
            onFileChangeMainAssembly: function (oEvent) {
                var oFileUploader = oEvent.getSource();
                var aFiles = oEvent.getParameter("files"); // Get all selected files
                var oTable = this.byId("caddetail_mainAssemblyTable");
                var iRowIndex = oTable.indexOfItem(oFileUploader.getParent().getParent());
                var aAllowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
                if (aAllowedFileTypes.indexOf(aFiles[0].type) === -1) {
                    MessageToast.show("Please upload a PDF or image file.");
                    oFileUploader.setValue("");
                    return;
                }

                var iMaxFileSize = 10 * 1024 * 1024;
                if (aFiles[0].size > iMaxFileSize) {
                    MessageToast.show("File size exceeds the limit of 10MB.");
                    oFileUploader.setValue("");
                    return;
                }
                if (aFiles.length) {
                    for (var i = 0; i < aFiles.length; i++) {
                        this._readFileAsBase64MainAssembly(aFiles[i], iRowIndex, i);
                    }
                    //this._readFileAsBase64MainAssembly(aFiles[iRowIndex], iRowIndex);
                }
                else {
                    MessageToast.show("No file selected");
                }
            },

            _readFileAsBase64MainAssembly: function (oFile, iRowIndex, iIndex) {
                this._aBase64FilesMainAssembly = {};
                var reader = new FileReader();
                reader.onload = function (event) {
                    var base64String = event.target.result.split(",")[1]; // Remove the Data URL prefix

                    var fileData = {
                        extension: oFile.type.split("/")[1],
                        fileName: oFile.name.split(".")[0],
                        fileSize: oFile.size,
                        displayName: oFile.name,
                        base64String: base64String
                    };
                    this._aBase64FilesMainAssembly = fileData;

                    if (iIndex == iRowIndex) {
                        MessageToast.show("File Upload successfully: " + fileData.fileName);
                    }
                }.bind(this);
                reader.onerror = function (error) {
                    MessageToast.show("Error reading file: " + error);
                };
                reader.readAsDataURL(oFile);
            },

            onFileChangeSubAssembly: function (oEvent) {
                var oFileUploader = oEvent.getSource();
                var aFiles = oEvent.getParameter("files"); // Get all selected files

                var oTable = this.byId("caddetail_subAssemblyTable");
                let iRowIndex = oTable.indexOfItem(oFileUploader.getParent().getParent());
                this._fileDataSub[iRowIndex] = {};
                // Store the file data for the specific row
                this._fileDataSub[iRowIndex] = aFiles[0];
                var aAllowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

                if (aAllowedFileTypes.indexOf(aFiles[0].type) === -1) {
                    MessageToast.show("Please upload a PDF or image file.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }

                var iMaxFileSize = 10 * 1024 * 1024; // 5MB in bytes
                if (aFiles[0].size > iMaxFileSize) {
                    MessageToast.show("File size exceeds the limit of 10MB.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }
                if (!this._aBase64FilesSubAssembly) {
                    this._aBase64FilesSubAssembly = [];
                }

                // Read files as base64

                // if (this._fileDataSub.length) {
                // for (var i = 0; i < this._fileDataSub.length; i++) {
                //     this._aBase64FilesSubAssembly[i] = {
                //         extension: null,
                //         fileName: null,
                //         fileSize: null,
                //         displayName: null,
                //         base64String: null
                //     };
                // }
                //this._readFileAsBase64SubAssembly(this._fileData[iRowIndex], iRowIndex);
                // }
                // else {
                //     MessageToast.show("No file selected");
                // }
                this._readFileAsBase64SubAssembly(this._fileDataSub[iRowIndex], iRowIndex, iRowIndex);
            },
            _readFileAsBase64SubAssembly: function (oFile, iIndex, iRowIndex) {

                if (!oFile) {
                    this._aBase64FilesSubAssembly[iIndex] = {
                        extension: null,
                        fileName: null,
                        fileSize: null,
                        displayName: null,
                        base64String: null
                    };
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    var base64String = event.target.result.split(",")[1]; // Remove the Data URL prefix
                    var fileData = {
                        extension: oFile.type.split("/")[1],
                        fileName: oFile.name.split(".")[0],
                        fileSize: oFile.size,
                        displayName: oFile.name,
                        base64String: base64String
                    };
                    this._aBase64FilesSubAssembly[iIndex] = fileData;


                    MessageToast.show("File Upload successfully: " + fileData.fileName);

                    return
                }.bind(this);
                reader.onerror = function (error) {
                    MessageToast.show("Error reading file: " + error);
                };
                reader.readAsDataURL(oFile);
            },
            onFileChangeChildAssembly: function (oEvent) {
                var oFileUploader = oEvent.getSource();
                var aFiles = oEvent.getParameter("files"); // Get all selected files

                var oTable = this.byId("caddetail_childAssemblyTable");
                var iRowIndex = oTable.indexOfItem(oFileUploader.getParent().getParent());

                // Store the file data for the specific row
                this._fileDataChild[iRowIndex] = aFiles[0];
                var aAllowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

                if (aAllowedFileTypes.indexOf(aFiles[0].type) === -1) {
                    MessageToast.show("Please upload a PDF or image file.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }

                var iMaxFileSize = 10 * 1024 * 1024; // 5MB in bytes
                if (aFiles[0].size > iMaxFileSize) {
                    MessageToast.show("File size exceeds the limit of 10MB.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }
                if (!this._aBase64FilesChildAssembly) {
                    this._aBase64FilesChildAssembly = [];
                }

                // Read files as base64


                // for (var i = 0; i < this._fileDataChild.length; i++) {

                //     this._aBase64FilesChildAssembly[i] = {
                //         extension: null,
                //         fileName: null,
                //         fileSize: null,
                //         displayName: null,
                //         base64String: null
                //     };

                // }
                //this._readFileAsBase64ChildAssembly(this._fileData[iRowIndex], iRowIndex);

                // }
                // else {
                //     MessageToast.show("No file selected");
                // }
                this._readFileAsBase64ChildAssembly(this._fileDataChild[iRowIndex], iRowIndex, iRowIndex);
            },
            _readFileAsBase64ChildAssembly: function (oFile, iIndex, iRowIndex) {

                if (!oFile) {
                    this._aBase64FilesChildAssembly[iIndex] = {
                        extension: null,
                        fileName: null,
                        fileSize: null,
                        displayName: null,
                        base64String: null
                    };
                    return;
                }
                var reader = new FileReader();

                reader.onload = function (event) {
                    var base64String = event.target.result.split(",")[1]; // Remove the Data URL prefix
                    var fileData = {
                        extension: oFile.type.split("/")[1],
                        fileName: oFile.name.split(".")[0],
                        fileSize: oFile.size,
                        displayName: oFile.name,
                        base64String: base64String
                    };

                    this._aBase64FilesChildAssembly[iIndex] = fileData;

                    MessageToast.show("File Upload successfully: " + oFile.name);

                }.bind(this);
                reader.onerror = function (error) {
                    MessageToast.show("Error reading file: " + error);
                };
                reader.readAsDataURL(oFile);

            },

            onFileChangeSeekAdvice: function (oEvent) {
                var oFileUploader = oEvent.getSource();
                var aFiles = oEvent.getParameter("files"); // Get all selected files

                var oTable = this.byId("caddetail_cad_seekAdviceTable");
                var iRowIndex = oTable.indexOfItem(oFileUploader.getParent().getParent());

                // Store the file data for the specific row
                this._fileDataSeek[iRowIndex] = aFiles[0];
                var aAllowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

                if (aAllowedFileTypes.indexOf(aFiles[0].type) === -1) {
                    MessageToast.show("Please upload a PDF or image file.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }

                var iMaxFileSize = 10 * 1024 * 1024; // 5MB in bytes
                if (aFiles[0].size > iMaxFileSize) {
                    MessageToast.show("File size exceeds the limit of 10MB.");
                    oFileUploader.setValue(""); // Clear the FileUploader
                    return;
                }
                if (!this._aBase64FilesSeekAdvice) {
                    this._aBase64FilesSeekAdvice = [];
                }

                // Read files as base64

                // if (this._fileDataSeek.length) {
                // for (var i = 0; i < this._fileDataSeek.length; i++) {
                //         if( this._fileDataSeek[i]==null || this._fileDataSeek[i]== undefined || Object.keys(this._fileDataSeek[i]).length==0 )
                //   {  this._aBase64FilesSeekAdvice[i] = {
                //         extension: null,
                //         fileName: null,
                //         fileSize: null,
                //         displayName: null,
                //         base64String: null
                //     };
                // }

                // }

                this._readFileAsBase64SeekAdvice(this._fileDataSeek[iRowIndex], iRowIndex, iRowIndex);


            },

            _readFileAsBase64SeekAdvice: function (oFile, iIndex, iRowIndex) {
                if (!oFile) {
                    this._aBase64FilesSeekAdvice[iIndex] = {
                        extension: null,
                        fileName: null,
                        fileSize: null,
                        displayName: null,
                        base64String: null
                    };
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    var base64String = event.target.result.split(",")[1]; // Remove the Data URL prefix
                    var fileData = {
                        extension: oFile.type.split("/")[1],
                        fileName: oFile.name.split(".")[0],
                        fileSize: oFile.size,
                        displayName: oFile.name,
                        base64String: base64String
                    };
                    this._aBase64FilesSeekAdvice[iIndex] = fileData;
                    MessageToast.show("File Upload successfully: " + oFile.name);
                }.bind(this);
                reader.onerror = function (error) {
                    MessageToast.show("Error reading file: " + error);
                };
                reader.readAsDataURL(oFile);

            },
            onDownloadFile: async function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
                var oView = this.getView();
                var oModel = oView.getModel(this.getEntryFormDataSourceModelName());
                var oDataAttachment = oModel.getProperty("/InspDraw/" + iIndex); // Adjust path based on your model structure
                var oDataSeekAdvice = oModel.getProperty("/SeekAdvice/" + iIndex);
                var oDataMainAssembly = oModel.getProperty("/MainAssembly/" + iIndex);
                var oDataSubAssembly = oModel.getProperty("/SubAssembly/" + iIndex);
                var oDataChildAssembly = oModel.getProperty("/ChildAssembly/" + iIndex);// Adjust path based on your model structure
                var oButton = oEvent.getSource();
                var sButtonId = oButton.getId();
                if (sButtonId.includes('caddetail_downloadBtn')) {
                    var payload = {
                        ID: oDataAttachment.InspRefDocAbsId_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_downloadBtn1')) {
                    var payload = {
                        ID: oDataAttachment.DraftAttachmentAbsId_AbsId
                    };
                }

                if (sButtonId.includes('caddetail_seekDownloadBtn')) {
                    var payload = {
                        ID: oDataSeekAdvice.SeekAdviceDocAbsId_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_mainDownloadBtn')) {
                    var payload = {
                        ID: oDataMainAssembly.AssemblyCadAttachment_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_subDownloadBtn')) {
                    var payload = {
                        ID: oDataSubAssembly.AssemblyCadAttachment_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_childDownloadBtn')) {
                    var payload = {
                        ID: oDataChildAssembly.AssemblyCadAttachment_AbsId
                    };
                }

                await this.createNewModelUsingAPI("POST", "/odata/v4/stoneman-attachment/GetAttachmentDataWithFile", payload, "downloadAttachModel");
                let downloadAttachModel = this.getView().getModel("downloadAttachModel");
                let data = downloadAttachModel.getData();

                var sBase64 = data.value.Base64File;
                var sFileType = data.value.FileExtension;
                var actualFileName = data.value.ActualFileName;

                // Convert base64 to binary (Blob)
                var byteCharacters = atob(sBase64);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: sFileType });
                // Create a Blob URL and trigger download
                var sBlobUrl = URL.createObjectURL(blob);
                var aLink = document.createElement('a');
                aLink.href = sBlobUrl;
                aLink.download = actualFileName + sFileType; // Assuming file extension is part of sFileType
                aLink.click();
                MessageToast.show("File downloaded successfully.");



            },
            onViewFile: async function (oEvent) {
                var iIndex = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
                var oView = this.getView();
                var oModel = oView.getModel(this.getEntryFormDataSourceModelName());
                var oDataAttachment = oModel.getProperty("/InspDraw/" + iIndex);
                var oDataSeekAdvice = oModel.getProperty("/SeekAdvice/" + iIndex);
                var oDataMainAssembly = oModel.getProperty("/MainAssembly/" + iIndex);
                var oDataSubAssembly = oModel.getProperty("/SubAssembly/" + iIndex);
                var oDataChildAssembly = oModel.getProperty("/ChildAssembly/" + iIndex);// Adjust path based on your model structure
                var oButton = oEvent.getSource();
                var sButtonId = oButton.getId();
                if (sButtonId.includes('caddetail_viewBtn')) {
                    var payload = {
                        ID: oDataAttachment.InspRefDocAbsId_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_viewBtn1')) {
                    var payload = {
                        ID: oDataAttachment.DraftAttachmentAbsId_AbsId
                    };
                }

                if (sButtonId.includes('caddetail_seekAttachBtn')) {
                    var payload = {
                        ID: oDataSeekAdvice.SeekAdviceDocAbsId_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_mainAttachBtn')) {
                    var payload = {
                        ID: oDataMainAssembly.AssemblyCadAttachment_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_subAttachBtn')) {
                    var payload = {
                        ID: oDataSubAssembly.AssemblyCadAttachment_AbsId
                    };
                }
                if (sButtonId.includes('caddetail_childAttachBtn')) {
                    var payload = {
                        ID: oDataChildAssembly.AssemblyCadAttachment_AbsId
                    };
                }



                // Make AJAX call to get the file

                await this.createNewModelUsingAPI("POST", "/odata/v4/stoneman-attachment/GetAttachmentDataWithFile", payload, "viewAttachModel");
                let viewAttachModel = this.getView().getModel("viewAttachModel");
                let data = viewAttachModel.getData();


                var sBase64 = data.value.Base64File; // Adjust based on your API response
                var sFileType = data.value.FileExtension; // Adjust based on your API response

                // Create a Blob object from the base64 string
                var byteCharacters = atob(sBase64);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: sFileType });

                // Create a URL for the Blob
                var sBlobUrl = URL.createObjectURL(blob);

                // Display the attachment based on the file type
                if (sFileType === ".pdf") {
                    var byteArray = new Uint8Array(byteNumbers);
                    var blob = new Blob([byteArray], { type: 'application/pdf' });
                    var sBlobUrl = URL.createObjectURL(blob);
                    var oPDFViewer = new PDFViewer();
                    this.getView().addDependent(oPDFViewer);
                    oPDFViewer.setSource(sBlobUrl);
                    oPDFViewer.open();
                }
                else if ((sFileType === ".png" || sFileType === ".avif" || sFileType === ".jpg" || sFileType === ".jpeg")) {
                    var oDialog = new Dialog({
                        title: "View Attachment",
                        content: new Image({
                            src: sBlobUrl,
                            width: "100%",
                            height: "100%"
                        }),
                        endButton: new sap.m.Button({
                            text: "Close",
                            press: function () {
                                oDialog.close();
                            }
                        })
                    });
                    oDialog.open();
                }



            },

            onUploadPress: async function (saveorsubmit) {


                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var oData = oModel.getData();
                oModel.setProperty("/SaveOrSubmit", saveorsubmit);

                //call attachment api
                var oPayload = [];
                var ChildAssembly = [];
                var SubAssembly = [];
                var MainAssembly = {};
                var AttachmentData = [];
                var SeekAdvice = [];
                absIDSeekAdvice = [];
                absIDSubAssembly = [];
                absIDChildAssembly = [];
                absIDMainAssembly = null;
                // this._aBase64Files.forEach(function (oFile, index) {
                //     AttachmentData[index] =
                //     {
                //         ActualFileName: oFile.fileName,
                //         DisplayName: oFile.displayName,
                //         FileExtension: "." + oFile.extension,
                //         Base64File: oFile.base64String
                //     }
                // });
                this._aBase64FilesSeekAdvice.forEach(function (oFile, index) {
                    if (oFile) {
                        SeekAdvice[index] = {
                            ActualFileName: oFile.fileName,
                            DisplayName: oFile.displayName,
                            FileExtension: "." + oFile.extension,
                            Base64File: oFile.base64String
                        };
                    } else {
                        SeekAdvice[index] = {
                            ActualFileName: "",
                            DisplayName: "",
                            FileExtension: "",
                            Base64File: ""
                        }; // Assign null if oFile is not present
                    }
                });
                let length = SeekAdvice.length;
                for (let i = 0; i < length; i++) {
                    if (SeekAdvice[i] == null) {
                        SeekAdvice[i] = {
                            ActualFileName: null,
                            DisplayName: null,
                            FileExtension: null,
                            Base64File: null
                        }
                    }
                }

                if (Object.entries(this._aBase64FilesMainAssembly).length != 0) {
                    MainAssembly = {
                        ActualFileName: this._aBase64FilesMainAssembly.fileName,
                        DisplayName: this._aBase64FilesMainAssembly.displayName,
                        FileExtension: "." + this._aBase64FilesMainAssembly.extension,
                        Base64File: this._aBase64FilesMainAssembly.base64String
                    }
                }
                else {
                    MainAssembly = null;
                }
                this._aBase64FilesSubAssembly.forEach(function (oFile, index) {
                    SubAssembly[index] =
                    {
                        ActualFileName: oFile.fileName,
                        DisplayName: oFile.displayName,
                        FileExtension: "." + oFile.extension,
                        Base64File: oFile.base64String
                    }
                });
                let lengthsub = SubAssembly.length;
                for (let i = 0; i < lengthsub; i++) {
                    if (SubAssembly[i] == null) {
                        SubAssembly[i] = {
                            ActualFileName: null,
                            DisplayName: null,
                            FileExtension: null,
                            Base64File: null
                        }
                    }
                }
                this._aBase64FilesChildAssembly.forEach(function (oFile, index) {
                    ChildAssembly[index] =
                    {
                        ActualFileName: oFile.fileName,
                        DisplayName: oFile.displayName,
                        FileExtension: "." + oFile.extension,
                        Base64File: oFile.base64String
                    }
                });
                let lengthchild = ChildAssembly.length;
                for (let i = 0; i < lengthchild; i++) {
                    if (ChildAssembly[i] == null) {
                        ChildAssembly[i] = {
                            ActualFileName: null,
                            DisplayName: null,
                            FileExtension: null,
                            Base64File: null
                        }
                    }
                }
                oPayload = {
                    CADDetail: true, CRForm: false, AttachmentData, SeekAdvice, MainAssembly, SubAssembly, ChildAssembly
                };
                console.log(oPayload);
                await this.createNewModelUsingAPI("POST", "/odata/v4/stoneman-attachment/Attachments", oPayload, "attachModel");
                let attachModel = this.getView().getModel("attachModel");
                let data = attachModel.getData();


                data.value.forEach(function (item) {
                    // if ('AttachmentData' in item) {
                    //   item.AttachmentData.forEach(function (ele) {
                    //     // if (item.includes('AttachmentData')) {
                    //     absID.push(ele.AbsId);
                    //     // } 
                    //   });
                    // }
                    if ('SeekAdvice' in item) {
                        absIDSeekAdvice = [];
                        item.SeekAdvice.forEach(function (el) {
                            absIDSeekAdvice.push(el.AbsId);
                        })
                    }
                    if ('SubAssembly' in item) {
                        absIDSubAssembly = [];
                        item.SubAssembly.forEach(function (el) {
                            absIDSubAssembly.push(el.AbsId);
                        })
                    }
                    if ('ChildAssembly' in item) {
                        absIDChildAssembly = [];
                        item.ChildAssembly.forEach(function (el) {
                            absIDChildAssembly.push(el.AbsId);
                        })
                    }


                    if ('MainAssembly' in item && item.MainAssembly !== null) {
                        absIDMainAssembly = item.MainAssembly.AbsId
                    } else {
                        absIDMainAssembly = null;
                    }

                })
                if (oData.MainAssembly) {
                    oData.MainAssembly.forEach(function (item, index) {
                        if (absIDMainAssembly != undefined && absIDMainAssembly != "") {
                            item.AssemblyCadAttachment_AbsId = absIDMainAssembly;
                        } else {
                            item.AssemblyCadAttachment_AbsId = item.AssemblyCadAttachment_AbsId;
                        }
                        item.DiameterUOM = Number(oData.MainAssembly[index].DiameterUOM);
                        item.HeightUOM = Number(oData.MainAssembly[index].HeightUOM);
                        item.LengthUOM = Number(oData.MainAssembly[index].LengthUOM);
                        item.TolDiameterUom = Number(oData.MainAssembly[index].TolDiameterUom);
                        item.TolHeightUom = Number(oData.MainAssembly[index].TolHeightUom);
                        item.TolLengthUom = Number(oData.MainAssembly[index].TolLengthUom);
                        item.TolWeightUom = Number(oData.MainAssembly[index].TolWeightUom);
                        item.TolWidthUom = Number(oData.MainAssembly[index].TolWidthUom);
                        item.WeightUom = Number(oData.MainAssembly[index].WeightUom);
                        item.WidthUOM = Number(oData.MainAssembly[index].WidthUOM);
                        delete oData.MainAssembly[index].srNo;
                        delete oData.MainAssembly[index].MainAssembly;
                        delete oData.MainAssembly[index].ManufacturingProcess_ID;
                        delete oData.MainAssembly[index].OperationNameWithSymbols_id;
                        delete oData.MainAssembly[index].SAP_UUID;
                        delete oData.MainAssembly[index].isNewRow;
                        delete oData.MainAssembly[index].isDownloadVisibleMain;
                        delete oData.MainAssembly[index].AssemblyCadAttachment;


                    })
                }
                else {
                    oData.MainAssembly = null
                }
                if (oData.SubAssembly) {
                    oData.SubAssembly.forEach(function (item, index) {

                        if (index < absIDSubAssembly.length && absIDSubAssembly[index] != undefined) {
                            item.AssemblyCadAttachment_AbsId = absIDSubAssembly[index];
                        }
                        else if (index < absIDSubAssembly.length && absIDSubAssembly[index] === undefined) {
                            item.AssemblyCadAttachment_AbsId = item.AssemblyCadAttachment_AbsId;
                        }
                        item.DiameterUOM = Number(oData.SubAssembly[index].DiameterUOM);
                        item.HeightUOM = Number(oData.SubAssembly[index].HeightUOM);
                        item.LengthUOM = Number(oData.SubAssembly[index].LengthUOM);
                        item.TolDiameterUom = Number(oData.SubAssembly[index].TolDiameterUom);
                        item.TolHeightUom = Number(oData.SubAssembly[index].TolHeightUom);
                        item.TolLengthUom = Number(oData.SubAssembly[index].TolLengthUom);
                        item.TolWeightUom = Number(oData.SubAssembly[index].TolWeightUom);
                        item.TolWidthUom = Number(oData.SubAssembly[index].TolWidthUom);
                        item.WeightUom = Number(oData.SubAssembly[index].WeightUom);
                        item.WidthUOM = Number(oData.SubAssembly[index].WidthUOM);

                        delete oData.SubAssembly[index].ManufacturingProcess;
                        delete oData.SubAssembly[index].srNo;
                        delete oData.SubAssembly[index].SubAssembly;
                        delete oData.SubAssembly[index].ManufacturingProcess_ID;
                        delete oData.SubAssembly[index].OperationNameWithSymbols_id;
                        delete oData.SubAssembly[index].SAP_UUID;
                        delete oData.SubAssembly[index].isNewRow;
                        delete oData.SubAssembly[index].isDownloadVisibleSub;
                        delete oData.SubAssembly[index].AssemblyCadAttachment;
                    })
                }
                else {
                    oData.SubAssembly = null;
                }
                if (oData.ChildAssembly) {
                    oData.ChildAssembly.forEach(function (item, index) {
                        if (index < absIDChildAssembly.length && absIDChildAssembly[index] != undefined) {
                            item.AssemblyCadAttachment_AbsId = absIDChildAssembly[index];
                        }
                        else if (index < absIDChildAssembly.length && absIDChildAssembly[index] === undefined) {
                            item.AssemblyCadAttachment_AbsId = item.AssemblyCadAttachment_AbsId;
                        }
                        item.Density = Number(oData.ChildAssembly[index].Density);
                        item.DFT = Number(oData.ChildAssembly[index].DFT);
                        item.DiameterUOM = Number(oData.ChildAssembly[index].DiameterUOM);
                        item.GrossQty = Number(oData.ChildAssembly[index].GrossQty);
                        item.GrossWeight = Number(oData.ChildAssembly[index].GrossWeight);
                        item.HeightUOM = Number(oData.ChildAssembly[index].HeightUOM);
                        item.LengthUOM = Number(oData.ChildAssembly[index].LengthUOM);
                        item.Micron = Number(oData.ChildAssembly[index].Micron);
                        item.NetWeight = Number(oData.ChildAssembly[index].NetWeight);
                        item.SpecificationDRGSize = Number(oData.ChildAssembly[index].SpecificationDRGSize);
                        item.SurfaceArea = Number(oData.ChildAssembly[index].SurfaceArea);
                        item.TolDiameterUom = Number(oData.ChildAssembly[index].TolDiameterUom);
                        item.TolHeightUom = Number(oData.ChildAssembly[index].TolHeightUom);
                        item.TolLengthUom = Number(oData.ChildAssembly[index].TolLengthUom);
                        item.TolWeightUom = Number(oData.ChildAssembly[index].TolWeightUom);
                        item.TolWidthUom = Number(oData.ChildAssembly[index].TolWidthUom);
                        item.WastagePer = Number(oData.ChildAssembly[index].WastagePer);
                        item.WidthUOM = Number(oData.ChildAssembly[index].WidthUOM);

                        delete oData.ChildAssembly[index].ManufacturingProcess;
                        delete oData.ChildAssembly[index].srNo;
                        delete oData.ChildAssembly[index].ChildAssembly;
                        delete oData.ChildAssembly[index].ManufacturingProcess_ID;
                        delete oData.ChildAssembly[index].OperationNameWithSymbols_id;
                        delete oData.ChildAssembly[index].SAP_UUID;
                        delete oData.ChildAssembly[index].isNewRow;
                        delete oData.ChildAssembly[index].isDownloadVisibleChild;
                        delete oData.ChildAssembly[index].AssemblyCadAttachment;
                    })
                }
                else {
                    oData.ChildAssembly = null
                }


                if (oData.SeekAdvice) {
                    oData.SeekAdvice.forEach(function (item, index) {
                        if (index < absIDSeekAdvice.length && absIDSeekAdvice[index] != undefined) {
                            item.SeekAdviceDocAbsId_AbsId = absIDSeekAdvice[index];
                        }
                        else if (index < absIDSeekAdvice.length && absIDSeekAdvice[index] === undefined) {
                            item.SeekAdviceDocAbsId_AbsId = item.SeekAdviceDocAbsId_AbsId;
                        }
                        delete oData.SeekAdvice[index].isDownloadVisibleSeek;
                        delete oData.SeekAdvice[index].isNewRow;
                        delete oData.SeekAdvice[index].srNo;
                    })

                }
                else {
                    oData.SeekAdvice = null
                }
                if (oData.Material) {
                    oData.Material.forEach(function (item, index) {

                        delete oData.Material[index].CrfReqID_CrfReqUUID;
                        delete oData.Material[index].createdAt;
                        delete oData.Material[index].createdBy;
                        delete oData.Material[index].modifiedAt;
                        delete oData.Material[index].modifiedBy;
                        delete oData.Material[index].MaterialID;

                    })


                }
                oModel.setData(oData);
                this.getView().setModel(this.getEntryFormDataSourceModelName(), oModel);

                let oModel1 = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let oData1 = oModel1.getData();

                if (this.getFormMode() == "3") {
                    oModel1.setProperty("/CreatedByUserID_UserID", loginInfo.UserID);
                }


                oModel1.setProperty("/loginUserID_UserID", loginInfo.UserID);
                oModel1.setProperty("/FormType", "CAD");


                let srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
                let trgObject = this.getView().getModel("saverequest").getData();

                this.transferObjectValues(srcObject, trgObject);

                await this.onPressOfEntryFormSaveButton(trgObject);
                const res = this.getApiResponseObject();
                if (res.success === true && this.getFormMode() == "3") {
                    {
                        MessageToast.show("CAD created successfully " + res.object.CadDetailNo);
                        setTimeout(function () {
                            this.router.navTo(this.getBackwardRoute());
                        }.bind(this), 500);
                    }
                }
                else if (res.success === true && this.getFormMode() == "2") {
                    MessageToast.show("CAD updated successfully " + res.object.CadDetailNo);
                    setTimeout(function () {
                        this.router.navTo(this.getBackwardRoute());
                    }.bind(this), 500);
                }
                else {
                    MessageToast.show(res.object.responseJSON.error.message);
                }

                // let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
                // if (response && this.getFormMode() == "3") {
                //     MessageToast.show("CAD created successfully " + response.CadDetailNo);
                //     setTimeout(function () {
                //         this.router.navTo(this.getBackwardRoute());
                //     }.bind(this), 500);
                // }
                // else if (response && this.getFormMode() == "2") {
                //     MessageToast.show("CAD updated successfully " + response.CadDetailNo);
                //     setTimeout(function () {
                //         this.router.navTo(this.getBackwardRoute());
                //     }.bind(this), 500);
                // }

            },


            onTabSelect: function () {
                var oTable = this.byId("caddetail_mainAssemblyTable"); // Replace with your table's ID

                var oScrollContainer = this.byId("caddetail_scrollcontainerMain");

                // Use setTimeout to ensure it runs after the tab content is fully loaded
                oScrollContainer.addEventDelegate({
                    onAfterRendering: function () {
                        var oScrollContainerDomRef = oScrollContainer.getDomRef();
                        var oTableDomRef = oTable.getDomRef();

                        if (oScrollContainerDomRef && oTableDomRef) {

                            oScrollContainerDomRef.scrollLeft = 0;

                        }
                    }.bind(this)
                });

                var oTable2 = this.byId("caddetail_subAssemblyTable"); // Replace with your table's ID

                var oScrollContainer2 = this.byId("caddetail_scrollcontainerSub");

                // Use setTimeout to ensure it runs after the tab content is fully loaded
                oScrollContainer2.addEventDelegate({
                    onAfterRendering: function () {
                        var oScrollContainerDomRef = oScrollContainer2.getDomRef();
                        var oTableDomRef = oTable2.getDomRef();

                        if (oScrollContainerDomRef && oTableDomRef) {

                            oScrollContainerDomRef.scrollLeft = 0;

                        }
                    }.bind(this)
                });
                var oTable3 = this.byId("caddetail_childAssemblyTable"); // Replace with your table's ID

                var oScrollContainer3 = this.byId("caddetail_scrollcontainerChild");

                // Use setTimeout to ensure it runs after the tab content is fully loaded
                oScrollContainer3.addEventDelegate({
                    onAfterRendering: function () {
                        var oScrollContainerDomRef = oScrollContainer3.getDomRef();
                        var oTableDomRef = oTable3.getDomRef();

                        if (oScrollContainerDomRef && oTableDomRef) {

                            oScrollContainerDomRef.scrollLeft = 0;

                        }
                    }.bind(this)
                });
            },
            onUploadSeekAdvice: async function () {
                var oPayload = [];
                var ChildAssembly = [];
                var SubAssembly = [];
                var MainAssembly = {};
                var AttachmentData = [];
                var SeekAdvice = [];
                absIDSeekAdvice = [];
                absIDSubAssembly = [];
                absIDChildAssembly = [];
                absIDMainAssembly = null;
                this._aBase64Files.forEach(function (oFile, index) {
                    AttachmentData[index] =
                    {
                        ActualFileName: oFile.fileName,
                        DisplayName: oFile.displayName,
                        FileExtension: "." + oFile.extension,
                        Base64File: oFile.base64String
                    }
                });
                this._aBase64FilesSeekAdvice.forEach(function (oFile, index) {
                    if (oFile) {
                        SeekAdvice[index] = {
                            ActualFileName: oFile.fileName,
                            DisplayName: oFile.displayName,
                            FileExtension: "." + oFile.extension,
                            Base64File: oFile.base64String
                        };
                    } else {
                        SeekAdvice[index] = {
                            ActualFileName: "",
                            DisplayName: "",
                            FileExtension: "",
                            Base64File: ""
                        }; // Assign null if oFile is not present
                    }
                });
                let length = SeekAdvice.length;
                for (let i = 0; i < length; i++) {
                    if (SeekAdvice[i] == null) {
                        SeekAdvice[i] = {
                            ActualFileName: null,
                            DisplayName: null,
                            FileExtension: null,
                            Base64File: null
                        }
                    }
                }

                if (Object.entries(this._aBase64FilesMainAssembly).length != 0) {
                    MainAssembly = {
                        ActualFileName: this._aBase64FilesMainAssembly.fileName,
                        DisplayName: this._aBase64FilesMainAssembly.displayName,
                        FileExtension: "." + this._aBase64FilesMainAssembly.extension,
                        Base64File: this._aBase64FilesMainAssembly.base64String
                    }
                }
                else {
                    MainAssembly = null;
                }
                this._aBase64FilesSubAssembly.forEach(function (oFile, index) {
                    SubAssembly[index] =
                    {
                        ActualFileName: oFile.fileName,
                        DisplayName: oFile.displayName,
                        FileExtension: "." + oFile.extension,
                        Base64File: oFile.base64String
                    }
                });
                this._aBase64FilesChildAssembly.forEach(function (oFile, index) {
                    ChildAssembly[index] =
                    {
                        ActualFileName: oFile.fileName,
                        DisplayName: oFile.displayName,
                        FileExtension: "." + oFile.extension,
                        Base64File: oFile.base64String
                    }
                });
                oPayload = {
                    CADDetail: true, CRForm: false, AttachmentData, SeekAdvice, MainAssembly, SubAssembly, ChildAssembly
                };
                console.log(oPayload);
                await this.createNewModelUsingAPI("POST", "/odata/v4/stoneman-attachment/Attachments", oPayload, "attachModel");
                let attachModel = this.getView().getModel("attachModel");
                let data = attachModel.getData();


                data.value.forEach(function (item) {
                    if ('SeekAdvice' in item) {
                        absIDSeekAdvice = [];
                        item.SeekAdvice.forEach(function (el) {
                            absIDSeekAdvice.push(el.AbsId);
                        })
                    }
                    if ('SubAssembly' in item) {
                        absIDSubAssembly = [];
                        item.SubAssembly.forEach(function (el) {
                            absIDSubAssembly.push(el.AbsId);
                        })
                    }
                    if ('ChildAssembly' in item) {
                        absIDChildAssembly = [];
                        item.ChildAssembly.forEach(function (el) {
                            absIDChildAssembly.push(el.AbsId);
                        })
                    }


                    if ('MainAssembly' in item && item.MainAssembly !== null) {
                        absIDMainAssembly = item.MainAssembly.AbsId
                    } else {
                        absIDMainAssembly = null;
                    }

                })


                this.onSaveSeekAdvice(absIDSeekAdvice);
                //MessageToast.show("File uploaded successfully!");
            },
            onSaveSeekAdvice: async function (absIDSeekAdvice) {
                var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                var oData = oModel.getData();
                var seekAdviceBody = {
                    CadDetailUUID: this.getListViewEditPropertyValue(),
                    SeekAdvice: []
                }
                if (oData.SeekAdvice) {
                    oData.SeekAdvice.forEach(function (item, index) {
                        if (index < absIDSeekAdvice.length && absIDSeekAdvice[index] != undefined) {
                            item.SeekAdviceDocAbsId_AbsId = absIDSeekAdvice[index];
                        }
                        else if (index < absIDSeekAdvice.length && absIDSeekAdvice[index] === undefined) {
                            item.SeekAdviceDocAbsId_AbsId = item.SeekAdviceDocAbsId_AbsId;
                        }

                        let seekadvice = {
                            DepartmentCode: item.DepartmentCode,
                            DepartmentName: item.DepartmentName,
                            UserID_UserID: item.UserID_UserID,
                            RoleCode_RoleCode_RoleConstant: item.RoleCode_RoleCode_RoleConstant,
                            Question: item.Question,
                            Answer: item.Answer,
                            SeekAdviceDocAbsId_AbsId: item.SeekAdviceDocAbsId_AbsId,
                            QuestionFrom_UserID: item.QuestionFrom_UserID
                        }

                        delete item.isDownloadVisibleSeek;
                        delete item.isNewRow;
                        seekAdviceBody.SeekAdvice.push(seekadvice);
                    })
                }
                else {
                    seekAdviceBody.SeekAdvice = null
                }
                await this.createNewModelUsingAPI("PATCH", "/odata/v4/stoneman-crf/TCadDetail(" + this.getListViewEditPropertyValue() + ")", seekAdviceBody, "responseModel");
                let responseModel = this.getView().getModel("responseModel");
                let data = responseModel.getData();

                if (data) {
                    MessageToast.show("Seek Advice Added Successfully " + data.CadDetailNo);
                    setTimeout(
                        function () {
                            this.router.navTo(this.getBackwardRoute());
                        }.bind(this),
                        1000
                    );
                } else {
                    MessageToast.show(data);
                }



            },

        })
    }
);
