sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core',
    '../model/formatter',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/UIComponent',
    '../service/WebService',
    'sap/ui/core/Fragment',
    './CFLDialog.controller',
    'sap/m/MessageToast',
    'sap/ui/core/routing/History'
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    Core,
    formatter,
    DateFormat,
    UIComponent,
    WebService,
    Fragment,
    CFLDialog,
    MessageToast,
    History
  ) {
    'use strict';
    var that;
    var screen = 'add';
    var title;
    var TH_ID;
    var objGlobalThis;
    var headerDataOnEdit;

    var fltSONo;
    var fltSONoLineNo;
    var fltProjectTemplate;
    var fltProjectStatus;
    var fltStartDate;
    var selectedMutliCombo = [];
    var soLineItemCategory;
    var soDateDifferenceInDay;
    var loginInfo;
    var roleInfo;

    return Controller.extend('stoneman.controller.AddEditTimeAndActionForm', {
      onInit: function () {
        objGlobalThis = this;
        // if (sap.ushell.Container.getRenderer("fiori2")) {
        //     sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(false, true);
        // }
        this.getView().addEventDelegate(
          {
            onBeforeShow: this.onBeforeShow,
            onAfterShow: this.onAfterShow
          },
          this
        );
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute('RouteNameAddEditTimeAndAction').attachMatched(this.onRouteMatched, this);

        sap.ui.getCore().getEventBus().subscribe('ProjectTempDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);
        sap.ui.getCore().getEventBus().subscribe('SalesOrderDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);
        sap.ui
          .getCore()
          .getEventBus()
          .subscribe('SalesOrderLineItemDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);

        this.disableInputInDatePickers();
        this.setPropertyManualy();
      },
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
      navBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo('RouteNameSearchTimeAndAction', {}, true);
        }
      },
      onExit: function () {
        // Clean up resources or detach event handlers
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.detachRouteMatched(that.onRouteMatched, this);
      },
      onRouteMatched: async function (oEvent) {
        that = this;
        //get login user data
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        roleInfo = lstorage.get('role_details');
        loginInfo = lstorage.get('login_info');

        //set loogin user name on header
        this.myName = loginInfo['Username'];
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, 'view');

        var oArguments = oEvent.getParameter('arguments');
        var uuid = (TH_ID = oArguments.data);
        screen = uuid === '-1' ? 'add' : 'edit';

        ////////
        that.setModelData();
        //Set Title
        that.setTitle();
      },
      setTitle: function () {
        //set title
        var obji18n = this.getView().getModel('i18n').getResourceBundle();
        title = screen == 'add' ? obji18n.getText('ADDTITLETIMEANDACTION') : obji18n.getText('EDITTITLETIMEANDACTION');
        this.byId('pageAddEdit').setTitle(title);
        //set button value
        var btnTitle = screen == 'add' ? obji18n.getText('TASAVE') : obji18n.getText('TAUPDATE');
        this.getView().byId('btnSaveUpdate').setText(btnTitle);
      },

      setModelData: function () {
        //header data
        var sPathHList = jQuery.sap.getModulePath('stoneman', '/model/ST_SearchHeaderListModel.json');
        var hModel = new sap.ui.model.json.JSONModel(sPathHList);
        objGlobalThis.getView().setModel(hModel, 'HeaderListModel');
        if (screen == 'edit') {
          hModel.attachRequestCompleted(function () {
            var hData = hModel.getData();
            if (hData['value'] != undefined) {
              hData['value'][0] = headerDataOnEdit;

              //Sort array Day Wise

              console.log('hData*******************', hData);
              if (hData['value'][0] != undefined) {
                var value = hData['value'][0]['tactiondetail'];
                let sortedArr = objGlobalThis.sortLineLevelData(value);
                let mappedArr = objGlobalThis.mapLineLevelData(sortedArr);
                hData['value'][0]['tactiondetail'] = mappedArr;
                console.log(hData['value']);

                hModel.setData(hData);
                objGlobalThis.getView().setModel(hModel, 'HeaderListModel');
              }
            }
          });
        }

        //Project Status*************************************************************
        var sPathPStatus = jQuery.sap.getModulePath('stoneman', '/model/ST_ProjectStatusModel.json');
        var oModelPStatus = new sap.ui.model.json.JSONModel(sPathPStatus);
        objGlobalThis.getView().setModel(oModelPStatus, 'projectStatusModel');

        WebService.getProjectStatus().then(function (response) {
          if (response.code == 200) {
            objGlobalThis.bindDataToModel(response['data'], 'ProjectStatus');
          }
        });

        //Task Status*************************************************************
        var sPathTblTStatus = jQuery.sap.getModulePath('stoneman', '/model/ST_TaskStatusListModel.json');
        var oModelTblTStatus = new sap.ui.model.json.JSONModel(sPathTblTStatus);
        this.getView().setModel(oModelTblTStatus, 'TaskStatusListModel');
        WebService.getTaskStatusList().then(function (response) {
          if (response.code == 200) {
            objGlobalThis.bindDataToModel(response['data'], 'TaskStatus');
          }
        });

        //Employee Responsible*************************************************************
        var sPathTblEmp = jQuery.sap.getModulePath('stoneman', '/model/ST_BusinessPartnerEmployeeModel.json');
        var oModelTblEmp = new sap.ui.model.json.JSONModel(sPathTblEmp);
        this.getView().setModel(oModelTblEmp, 'EmployeeListModel');

        //Factory Calendar*********************************
        var sPathCalendar = jQuery.sap.getModulePath('stoneman', '/model/ST_FactoryCalendar.json');
        var oModelCal = new sap.ui.model.json.JSONModel(sPathCalendar);
        this.getView().setModel(oModelCal, 'FactoryCalendarModel');
        WebService.callFactoryCalendarAPI().then(function (response) {
          if (response.code == 200) {
            var oModelC = objGlobalThis.getView().getModel('FactoryCalendarModel');
            //var oData = oModelC.getData();
            var data = response['data']['d'];
            oModelC.setData(data);
            oModelC.refresh(true);
          }
        });

        if (screen == 'add') {
          debugger;
          //Sales Order List
          var sPathSO = jQuery.sap.getModulePath('stoneman', '/model/ST_SalesOrderListModel.json');
          var oModelSO = new sap.ui.model.json.JSONModel(sPathSO);
          objGlobalThis.getView().setModel(oModelSO, 'salesOrderListModel');
          WebService.callSalesOrderAPI().then(function (resonse) {
            if (resonse.code == 200) {
              var oModel = objGlobalThis.getView().getModel('salesOrderListModel');
              oModel.setData(resonse['data']['d']);
              objGlobalThis.getView().setModel(oModel, 'salesOrderListModel');
            }
          });

          //Sales Order Line Item List
          var sPathSO = jQuery.sap.getModulePath('stoneman', '/model/ST_SalesOrderLineItemModel.json');
          var oModelSO = new sap.ui.model.json.JSONModel(sPathSO);
          objGlobalThis.getView().setModel(oModelSO, 'salesOrderLineItemListModel');

          //Project Template
          var sPathSO = jQuery.sap.getModulePath('stoneman', '/model/ST_ProjectTemplateListModel.json');
          var oModelSO = new sap.ui.model.json.JSONModel(sPathSO);
          objGlobalThis.getView().setModel(oModelSO, 'projectTemplateListModel');
          //call project template api
          WebService.callEnterpriseProjectListAPI().then(function (resonse) {
            if (resonse.code == 200) {
              var oModel = objGlobalThis.getView().getModel('projectTemplateListModel');
              oModel.setData(resonse['data']['d']);
              oModel.refresh(true);
              // objGlobalThis.getView().setModel(oModel, "projectTemplateListModel");
            }
          });

          this.refreshScreenWhenAddNew();
        }
      },

      onAfterShow: function () {
        if (screen == 'edit') {
          WebService.getHeaderChildList(TH_ID, loginInfo['UserID']).then(function (response) {
            console.log(response);
            fltStartDate = formatter.getDateFromatIn_ddMMyyyy(response['data'].tah_startdate);
            if (roleInfo['RoleCode'] == 'TAUser') {
              let filteredDetailData = response['data'].tactiondetail.filter((ele) => {
                return ele.emp_id_UserID != null && ele.emp_id_UserID == loginInfo['UserID'];
              });
              response['data']['tactiondetail'] = filteredDetailData;
            }
            headerDataOnEdit = response['data'];
            debugger;
            var oModel = objGlobalThis.getView().getModel('HeaderListModel');
            oModel.setData({ value: [response['data']] });
            objGlobalThis.getView().setModel(oModel, 'HeaderListModel');
            objGlobalThis.setHeaderDataOnEdit();
          });
        }
      },

      refreshScreenWhenAddNew: function () {
        objGlobalThis.getView().byId('sapUiTA_NO').setValue(null);
        objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setValue(null);
        objGlobalThis.getView().byId('sapUiSO_NO').setValue(null);
        objGlobalThis.getView().byId('sapUiSTART_DATE').setValue(null);
        objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setValue(null);
        objGlobalThis.getView().byId('sapUiPROJECT_STATUS').setSelectedKey(null);
        objGlobalThis.getView().byId('sapUiUserComment').setSelectedKey(null);
        objGlobalThis.getView().byId('sapUiAdminComment').setSelectedKey(null);

        objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setEditable(false);
        objGlobalThis.getView().byId('sapUiSO_NO').setEditable(true);
        objGlobalThis.getView().byId('sapUiSTART_DATE').setEditable(false);
        objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setEditable(false);

        //line level data enable
        // objGlobalThis.getView().byId('sapUiSTART_DATE').setEnabled(true);
        objGlobalThis.getView().byId('sapUiPROJECT_STATUS').setEditable(true);
        objGlobalThis.getView().byId('sapUiACT_START_DATE').setEditable(true);
        objGlobalThis.getView().byId('sapUiEmprResp').setEditable(true);
        objGlobalThis.getView().byId('sapUiAdminComment').setEditable(true);
        objGlobalThis.getView().byId('sapUiUserComment').setEditable(false);
        objGlobalThis.getView().byId('cTaskStatus').setEditable(false);

        var oModel = objGlobalThis.getView().getModel('HeaderListModel'); //HeaderChildListModel
        if (oModel != undefined) {
          oModel.setData(null);
          objGlobalThis.getView().setModel(oModel, 'HeaderListModel');
        }
      },

      setHeaderDataOnEdit: async function () {
        objGlobalThis.getView().byId('sapUiTA_NO').setValue(headerDataOnEdit?.tah_no);
        objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setValue(headerDataOnEdit?.tah_prjtemplnme);
        objGlobalThis.getView().byId('sapUiSO_NO').setValue(headerDataOnEdit?.tah_sono);
        objGlobalThis.getView().byId('sapUiSTART_DATE').setValue(headerDataOnEdit?.tah_startdate);
        objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setValue(headerDataOnEdit?.tah_itemdesc);
        objGlobalThis.getView().byId('sapUiPROJECT_STATUS').setSelectedKey(headerDataOnEdit?.tah_prjstatuscode);
        objGlobalThis
          .getView()
          .byId('sapUiSO_Order_Date')
          .setValue(formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodate));
        objGlobalThis
          .getView()
          .byId('sapUiSO_DELIVERY_DATE')
          .setValue(formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodeldate));

        objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setEditable(false);
        objGlobalThis.getView().byId('sapUiSO_NO').setEditable(false);
        objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setEditable(false);
        objGlobalThis.getView().byId('sapUiSTART_DATE').setEditable(false);

        var oModel = objGlobalThis.getView().getModel('HeaderListModel');
        var data = oModel.getData();

        var oTable = objGlobalThis.getView().byId('TATable');
        var aItems = oTable.getItems();

        setTimeout(async () => {
          //disbale all rows by default
          var disableCount = 0;

          if (
            data?.value &&
            data?.value?.length > 0 &&
            data?.value[0]?.tactiondetail &&
            data?.value[0]?.tactiondetail?.length > 0
          ) {
            console.log(data['value'][0]['tactiondetail']);
            data['value'][0]['tactiondetail'].forEach((element) => {
              element.isEnabled = false;
              if (aItems.length > 0 && disableCount <= aItems.length) {
                //task status
                if (aItems[disableCount]) {
                  var cells = aItems[disableCount].getCells();
                  var cellId = cells[12].getId(); //.getAggregation('cells')[12].getId()
                  var cellObj = sap.ui.getCore().byId(cellId);
                  cellObj.setEditable(false);
                  //user remarks
                  var cellIdRem = aItems[disableCount].getAggregation('cells')[13].getId();
                  var cellObjRem = sap.ui.getCore().byId(cellIdRem);
                  cellObjRem.setEditable(false);
                  //admin remarks
                  var cellIdRem = aItems[disableCount].getAggregation('cells')[14].getId();
                  var cellObjRem = sap.ui.getCore().byId(cellIdRem);
                  cellObjRem.setEditable(false);
                }
              }
              disableCount = disableCount + 1;
            });
          }

          if (roleInfo['RoleCode'] == 'TAUser') {
            objGlobalThis.getView().byId('sapUiPROJECT_STATUS').setEditable(false);
            objGlobalThis.getView().byId('sapUiACT_START_DATE').setEditable(false);
            objGlobalThis.getView().byId('sapUiEmprResp').setEditable(false);
            objGlobalThis.getView().byId('sapUiACT_END_DATE').setEditable(false);
            objGlobalThis.getView().byId('sapUiAdminComment').setEditable(false);
            objGlobalThis.getView().byId('sapUiUserComment').setEditable(true);

            var count = 0;
            var iCount = 0;
            var lastEditableIndex = -1;
            // oModel.attachRequestCompleted(function () {
            var iIndex;
            if (data && data?.value[0]?.tactiondetail.length > 0) {
              for (var i = 0; i < data['value'][0]['tactiondetail'].length; i++) {
                if (data['value'][0]['tactiondetail'][i].tahd_tskstatuscode !== 'CL') {
                  // Set the first row that is not closed as editable
                  lastEditableIndex = i;
                  break;
                }
              }

              for (var j = 0; j < data['value'][0]['tactiondetail'].length; j++) {
                if (j === lastEditableIndex) {
                  data['value'][0]['tactiondetail'][j].editable = true;
                } else {
                  data['value'][0]['tactiondetail'][j].editable = false;
                }
              }

              for (let index = 0; index < data['value'][0]['tactiondetail'].length; index++) {
                const element = data['value'][0]['tactiondetail'][index];
                if (aItems.length > 0 && iCount <= aItems.length) {
                  // if (element.tahd_tskstatuscode == 'CL') {
                  //     //   iIndex = iCount;
                  //     element.isEnabled = false;
                  //     iIndex = iCount + 1;
                  //     data['value'][0]['tactiondetail'][iIndex].isEnabled = true;
                  // }
                  // // else if (iIndex == index) {
                  // //     //iIndex = iCount;
                  // //     element.isEnabled = true;
                  // // }
                  // else {
                  //     element.isEnabled = false;
                  //     // if (index == 0) {
                  //     //     element.isEnabled = true;
                  //     // } else {
                  //     //     element.isEnabled = false;
                  //     // }
                  // }
                  //task status
                  if (aItems[iCount]) {
                    //actual start date
                    var oRow = aItems[iCount]; // third row (0-based index)
                    var aCells = oRow.getAggregation('cells'); // get all cells in the row
                    aCells[8].setEditable(element.editable);
                    //actual end date
                    var oRow = aItems[iCount]; // third row (0-based index)
                    var aCells = oRow.getAggregation('cells'); // get all cells in the row
                    aCells[9].setEditable(element.editable);
                    //employee responsible
                    var oRow = aItems[iCount]; // third row (0-based index)
                    var aCells = oRow.getAggregation('cells'); // get all cells in the row
                    aCells[11].setEditable(false);
                    //task status
                    var cellId = aItems[iCount].getAggregation('cells')[12].getId();
                    var cellObj = sap.ui.getCore().byId(cellId);
                    cellObj.setEditable(element.editable);
                    //user remarks
                    var cellIdRem = aItems[iCount].getAggregation('cells')[13].getId();
                    var cellObjRem = sap.ui.getCore().byId(cellIdRem);
                    cellObjRem.setEditable(element.editable);
                  }
                }
                iCount = iCount + 1;
              }
            }
          } else {
            objGlobalThis.getView().byId('sapUiPROJECT_STATUS').setEditable(true);
            objGlobalThis.getView().byId('sapUiACT_START_DATE').setEditable(true);
            objGlobalThis.getView().byId('sapUiEmprResp').setEditable(true);
            objGlobalThis.getView().byId('sapUiACT_END_DATE').setEditable(true);
            objGlobalThis.getView().byId('sapUiAdminComment').setEditable(true);
            objGlobalThis.getView().byId('sapUiUserComment').setEditable(false);
            objGlobalThis.getView().byId('cTaskStatus').setEditable(false);

            //In case of close status employee responsible should not be enabled
            var iCount = 0;
            //                    oModel.attachRequestCompleted(async function () {
            if (data?.value?.length > 0 && data?.value[0] != undefined) {
              for (let index = 0; index < data['value'][0]['tactiondetail'].length; index++) {
                const element = data['value'][0]['tactiondetail'][index];
                if (aItems.length > 0 && iCount <= aItems.length) {
                  if (aItems) {
                    if (element.tahd_tskstatuscode == 'CL') {
                      element.isEnabled = false;
                      if (aItems[iCount]) {
                        //employee responsible
                        var oRow = aItems[iCount]; // third row (0-based index)
                        var aCells = oRow.getAggregation('cells'); // get all cells in the row
                        aCells[11].setEditable(false);
                      }
                    } else {
                      element.isEnabled = true;
                    }
                    if (aItems[iCount]) {
                      //admin remarks
                      var oRow = aItems[iCount]; // third row (0-based index)
                      var aCells = oRow.getAggregation('cells'); // get all cells in the row
                      aCells[14].setEditable(true);
                    }
                  }
                }
                iCount = iCount + 1;
              }
            }
            // });
          }

          //distinct array based on cost center
          if (data?.value) {
            const key = 'tahd_rescostcentername';
            const arrayUniqueByKey = [...new Map(data?.value[0]?.tactiondetail.map((item) => [item[key], item])).values()];
            var arrTempEmpAssign = [];
            for (let index = 0; index < arrayUniqueByKey.length; index++) {
              const element = arrayUniqueByKey[index];
              await WebService.callPersonWorkforceDetail(element.tahd_rescostcentername).then(function (resonse) {
                debugger;
                if (resonse.code == 200) {
                  resonse['data']['d']['results'].forEach((eleEmp) => {
                    arrTempEmpAssign.push(eleEmp);
                  });
                }
              });
            }

            var count = 0;
            data?.value[0]?.tactiondetail.forEach((element) => {
              if (element.tahd_tskstatuscode == null || element.tahd_tskstatuscode == 'O') {
                element.tahd_tskstatuscode = 'O';
                element.tahd_tskstatusdesc = 'Open';
              }

              let filteredData = arrTempEmpAssign.filter((ele) => {
                return element.tahd_rescostcentername === ele.CostCenter;
              });
              var Arr = [];
              filteredData.forEach((eleEmp) => {
                var dict = {
                  emp_id: eleEmp.BusinessPartnerUUID,
                  tah_id: null,
                  tahdtl_id: null,
                  emp_code: eleEmp.BusinessPartner,
                  emp_name: eleEmp.BusinessPartnerFullName,
                  tactiondetail_tahd_id: null
                };
                Arr.push(dict);
              });
              element.tempEmpAssign = Arr;

              if (aItems.length > 0 && count <= aItems.length) {
                var item = aItems[count];
                if (item) {
                  var oComboBox = item.getCells()[11];
                  if (element.emp_id_UserID != null) {
                    oComboBox.setSelectedKey(element.emp_code);
                  }
                }
              }
              count = count + 1;
            });
          }

          oModel.setData(data);
          objGlobalThis.getView().setModel(oModel, 'HeaderListModel');
          // oModel.refresh(true);
        }, 1000);

        debugger;
        //dates diff
        console.log('sostart', headerDataOnEdit?.tah_sodate);
        console.log('sodel', headerDataOnEdit?.tah_sodeldate);
        console.log('format1 ', formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodate));
        console.log('format2 ', formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodeldate));
        var dtSOStartDate = objGlobalThis.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodate));
        var dtSODelvDate = objGlobalThis.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(headerDataOnEdit?.tah_sodeldate));
        console.log('sostart', dtSOStartDate);
        console.log('sodel', dtSODelvDate);

        if (objGlobalThis.isDateValid(dtSODelvDate) && objGlobalThis.isDateValid(dtSOStartDate)) {
          const diffTimeDelay = Math.abs(dtSODelvDate - dtSOStartDate);
          soDateDifferenceInDay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
          this.byId('sapUiSO_DATE_DIFF').setValue(soDateDifferenceInDay);
        }
      },

      onExit() {
        var oModel = this.getView().getModel('routeSearchData');
        oModel.setData(null);
        sap.ui.getCore().getEventBus().unsubscribe('ProjectTempDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);
        sap.ui.getCore().getEventBus().unsubscribe('SalesOrderDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);
        sap.ui
          .getCore()
          .getEventBus()
          .unsubscribe('SalesOrderLineItemDialogAddEdit', 'rowSelectEvent', this.onDialogCloseAddEdit, this);
      },
      onLiveChange: function (oEvent) {
        // Prevent user from typing into the input field
        const oInput = oEvent.getSource();
        oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
      },
      disableInputInDatePickers: function () {
        //Planned Start Date
        objGlobalThis.getView().byId('sapUiPLN_ST_DATE').setEditable(false);
        //Planned End Date
        objGlobalThis.getView().byId('sapUiPLN_END_DATE').setEditable(false);

        //Start Date
        var oDatePickerST = this.getView().byId('sapUiSTART_DATE');
        oDatePickerST.addEventDelegate(
          {
            onAfterRendering: function () {
              var oDateInner = this.$().find('.sapMInputBaseInner');
              var oID = oDateInner[0].id;
              $('#' + oID).attr('disabled', 'disabled');
            }
          },
          oDatePickerST
        );

        //Actual Start Date
        var oDatePickerASDT = this.getView().byId('sapUiACT_START_DATE');
        oDatePickerASDT.addEventDelegate(
          {
            onAfterRendering: function () {
              var oDateInner = this.$().find('.sapMInputBaseInner');
              var oID = oDateInner[0].id;
              $('#' + oID).attr('disabled', 'disabled');
            }
          },
          oDatePickerASDT
        );

        //Actual End Date
        var oDatePickerAEDT = this.getView().byId('sapUiACT_END_DATE');
        oDatePickerAEDT.addEventDelegate(
          {
            onAfterRendering: function () {
              var oDateInner = this.$().find('.sapMInputBaseInner');
              var oID = oDateInner[0].id;
              $('#' + oID).attr('disabled', 'disabled');
            }
          },
          oDatePickerAEDT
        );
      },
      setPropertyManualy: function () {
        //Set Property
        var sapUiTA_NO = this.getView().byId('sapUiTA_NO');
        sapUiTA_NO.setValueHelpOnly(true);
        var sapUiPROJECT_TEMPLATE = this.getView().byId('sapUiPROJECT_TEMPLATE');
        sapUiPROJECT_TEMPLATE.setValueHelpOnly(true);
        var sapUiSO_NO = this.getView().byId('sapUiSO_NO');
        sapUiSO_NO.setValueHelpOnly(true);
        var sapUiSO_LINEITEM_NO = this.getView().byId('sapUiSO_LINEITEM_NO');
        sapUiSO_LINEITEM_NO.setValueHelpOnly(true);
      },
      onBeforeRendering: function () {},
      bindDataToModel: function (data, aFrom) {
        if (aFrom == 'TaskStatus') {
          var oModel = objGlobalThis.getView().getModel('TaskStatusListModel');
          var dict = {
            tsk_id: '-1',
            tskstatus_code: '-1',
            tskstatus_name: 'Select Task Status'
          };
          data['value'].splice(0, 0, dict);
          oModel.setData(data);
          objGlobalThis.getView().setModel(oModel, 'TaskStatusListModel');
          oModel.refresh(true);
        } else if (aFrom == 'ProjectStatus') {
          var oModel = objGlobalThis.getView().getModel('projectStatusModel');
          var dict = {
            prj_id: '-1',
            prjstatus_code: '-1',
            prjstatus_name: 'Select Project Status'
          };
          data['value'].splice(0, 0, dict);
          oModel.setData(data);
          objGlobalThis.getView().setModel(oModel, 'projectStatusModel');
          oModel.refresh(true);
        }
      },

      //Header Action
      //Dialog
      handleTA_NO: async function (oEvent) {
        var oView = this.getView();
        var obji18n = oView.getModel('i18n').getResourceBundle();
        var dialog = new CFLDialog(oView, obji18n.getText('TANO'), 'addedit'); //TANO
        dialog.open();
      },
      handlePROJECT_TEMPLATE: async function (oEvent) {
        var data;
        var oView = this.getView();
        //   if (this._From == 'addedit') {
        //     var oModel = oView.getModel('templateModel');
        //     data = oModel.getData();
        //   } else {//search
        //     var oModel = oView.getModel('projectTemplateListModel');
        //     data = oModel.getData();
        //   }
        var oModel = oView.getModel('templateModel');
        data = oModel.getData();
        //var oModel = oView.getModel('templateModel');//projectTemplateListModel

        var renewArr = new Array();
        for (let index = 0; index < data['results'].length; index++) {
          const element = data['results'][index];
          var dict = {
            CODE: element['Project'],
            NAME: element['ProjectDescription'],
            FIELD1: element['YY1_Category1_PPH'],
            FIELD2: element['YY1_NoofDays_PPH'],
            FIELD3: ''
          };
          renewArr.push(dict);
        }
        var dict = {
          title1: 'PROJECT TEMPLATE CODE',
          title2: 'PROJECT TEMPLATE DESCRIPTION',
          title3: 'CATEGORY',
          title4: 'NO OF DAYS',
          title5: '',
          list: renewArr
        };
        var oDataModel = new sap.ui.model.json.JSONModel(dict);
        oView.setModel(oDataModel, 'DataModel');
        var oModel = this.getView().getModel('DataModel');
        var odata = oModel.getData();

        var obji18n = oView.getModel('i18n').getResourceBundle();
        var dialog = new CFLDialog(oView, obji18n.getText('PROJECTTEMPLATE'), 'addedit', odata); //PROJECTTEMPLATE
        dialog.open();
      },
      handleSO_NO: async function (oEvent) {
        var oModel = this.getView().getModel('salesOrderListModel');
        var data = oModel.getData();
        var renewArr = new Array();
        for (let index = 0; index < data['results'].length; index++) {
          const element = data['results'][index];
          //sales order date
          var strSOStartDate = element['SalesOrderDate'];
          var numSOStartDate = strSOStartDate != null ? parseInt(strSOStartDate.replace(/[^0-9]/g, '')) : null;
          var dtSOStartDate = numSOStartDate != null ? new Date(numSOStartDate) : null;

          //so delivery date
          var strSODelvDate = element['RequestedDeliveryDate']; //"/Date(1268524800000)/";
          var numSODelvDate = strSODelvDate != null ? parseInt(strSODelvDate.replace(/[^0-9]/g, '')) : null;
          var dtSODelvDate = numSODelvDate != null ? new Date(numSODelvDate) : null;
          var dict = {
            CODE: element['SalesOrder'],
            NAME: element['SoldToParty'],
            FIELD1: '',
            FIELD2: dtSOStartDate != null ? formatter.getDateFromatIn_ddMMyyyy(dtSOStartDate) : '',
            FIELD3: dtSODelvDate != null ? formatter.getDateFromatIn_ddMMyyyy(dtSODelvDate) : ''
          };
          renewArr.push(dict);
        }
        var dict = {
          title1: 'SO No.',
          title2: 'BP CODE',
          title3: 'BP NAME',
          title4: 'SALES ORDER DATE',
          title5: 'SO DELIVERY DATE',
          list: renewArr
        };
        var oDataModel = new sap.ui.model.json.JSONModel(dict);
        this.getView().setModel(oDataModel, 'DataModel');
        var oView = this.getView();
        var obji18n = oView.getModel('i18n').getResourceBundle();
        //oDataModel.attachRequestCompleted(async function () {
        var oModel = this.getView().getModel('DataModel');
        var data = oModel.getData();
        var dialog = new CFLDialog(oView, obji18n.getText('SALESORDER'), 'addedit', data); //SALESORDER

        dialog.open();
        //});
      },
      handleSO_LINE_ITEM_NO: async function (oEvent) {
        var oView = this.getView();
        var oModel = oView.getModel('salesOrderLineItemListModel');
        var data = oModel.getData();
        var renewArr = new Array();
        for (let index = 0; index < data['to_Item']['results'].length; index++) {
          const element = data['to_Item']['results'][index];
          var dict = {
            CODE: element['SalesOrderItem'],
            NAME: element['SalesOrderItemText'],
            FIELD1: element['SalesOrder'],
            FIELD2: element['AdditionalMaterialGroup1'],
            FIELD3: ''
          };
          renewArr.push(dict);
        }
        var dict = {
          title1: 'SO LINE ITEM No.',
          title2: 'SO LINE ITEM NAME',
          title3: 'SO No.',
          title4: 'CATEGORY',
          title5: '',
          list: renewArr
        };
        var oDataModel = new sap.ui.model.json.JSONModel(dict);
        oView.setModel(oDataModel, 'DataModel');
        var oModel = this.getView().getModel('DataModel');
        var data = oModel.getData();

        var obji18n = oView.getModel('i18n').getResourceBundle();
        var dialog = new CFLDialog(oView, obji18n.getText('SALESORDERITEM'), 'addedit', data); //SALESORDERITEM
        dialog.open();
      },
      handlePROJECTSTATUSComboBox: function (oEvent) {
        var selText = oEvent.getParameter('selectedItem').getText();
        var selKey = oEvent.getParameter('selectedItem').getKey();
        var dict = {
          code: selKey,
          name: selText
        };
        fltProjectStatus = dict;

        var oModel = objGlobalThis.getView().getModel('HeaderListModel');
        var data = oModel.getData();
        data['value'][0].tah_prjstatuscode = selKey;
        data['value'][0].tah_prjstatusname = selText;

        oModel.setData(data);
        oModel.refresh(true);
      },
      handleEmployeeSelectionChange: function (oEvent) {
        debugger;
        var selText = oEvent.getParameter('selectedItem').getText();
        var selKey = oEvent.getParameter('selectedItem').getKey();

        var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
        var oModel = this.getView().getModel('HeaderListModel');
        var aData = oModel.getData();

        let filteredData = aData['value'][0]['tactiondetail'][index]['tempEmpAssign'].filter((ele) => {
          return ele.emp_code === selKey;
        });

        aData['value'][0]['tactiondetail'][index]['emp_id_UserID'] = filteredData[0]['emp_id'];
        aData['value'][0]['tactiondetail'][index]['emp_code'] = filteredData[0]['emp_code'];
        aData['value'][0]['tactiondetail'][index]['emp_name'] = filteredData[0]['emp_name'];

        // var arr = new Array()
        // if (filteredData.length>0){
        //     var dict = {
        //         emp_code: filteredData[0]['emp_code'],
        //         emp_id:filteredData[0]['emp_id'],
        //         emp_name: filteredData[0]['emp_name'],
        //     }
        // }
        // arr.push(dict);

        // // aData['value'][0]['tactiondetail'][index]['tempEmpAssign'] = arr;
        // aData['value'][0]['tactiondetail'][index]['tactiondetailEmpAssign'] =
        //     arr

        oModel.setData(aData);
        this.getView().setModel(oModel, 'HeaderListModel');
        oModel.refresh(true);
      },
      /*handleSelectionFinish: function (oEvent) {//employee selection
                            const aSelectedItems = oEvent.getParameter("selectedItems");
                            var arr = new Array();
                            for (let index = 0; index < aSelectedItems.length; index++) {
                                const element = aSelectedItems[index];
                                var dict = {
                                    "emp_code": element.getKey(),
                                    "emp_name": element.getText()
                                }
                                arr.push(dict);
                            }
                            var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
                            var oModel = this.getView().getModel("HeaderListModel");
                            var aData = oModel.getData();
                    
                            aData['value'][0]['tactiondetail'][index]['tempEmpAssign'] = arr;
                            aData['value'][0]['tactiondetail'][index]['tactiondetailEmpAssign'] = arr;
                    
                            oModel.setData(aData);
                            this.getView().setModel(oModel, "HeaderListModel");
                            oModel.refresh(true);
                        },*/
      countweekoffdays: function (startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
          const dayOfWeek = curDate.getDay();
          var result = objGlobalThis.checkForFactoryCalendar(dayOfWeek);
          if (result['isItWorking'] == 0) {
            //holiday
            count++;
          }
          //if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
          curDate.setDate(curDate.getDate() + 1);
        }
        return count;
      },
      /*countWeekendDays: function (d0, d1) {
                            var ndays = 1 + Math.round((d1.getTime() - d0.getTime()) / (24 * 3600 * 1000));
                            var nsaturdays = Math.floor((d0.getDay() + ndays) / 7);
                            var result;
                    
                    
                    
                            switch (nsaturdays) {
                                case 0://sunday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 1://monday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 2://tuesday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 3://wednesday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 4://thurday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 5://friday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                case 6://saturday
                                    result = 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                                    break;
                                default:
                                    break;
                            }
                            return 2 * nsaturdays + (d0.getDay() == 0) - (d1.getDay() == 6);
                    
                    
                        },*/
      checkForFactoryCalendar: function (selectedDay) {
        var isWorking = -1;
        var daySelected = 'select';
        var isSelectedDayHoliday = false;
        var oModelFC = objGlobalThis.getView().getModel('FactoryCalendarModel');
        var oDataFC = oModelFC.getData();

        if (oDataFC != undefined) {
          switch (selectedDay) {
            case 1: //monday
              daySelected = 'monday'; //0=holiday 1=working
              isWorking = oDataFC.MondayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.MondayIsWorkingDay == 0?true:false;
              break;
            case 2: //tuesday
              daySelected = 'tuesday';
              isWorking = oDataFC.TuesdayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.TuesdayIsWorkingDay == 0?true:false;
              break;
            case 3: //wednesday
              daySelected = 'wednesday';
              isWorking = oDataFC.WednesdayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.WednesdayIsWorkingDay == 0?true:false;
              break;
            case 4: //thursday
              daySelected = 'thursday';
              isWorking = oDataFC.ThursdayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.ThursdayIsWorkingDay == 0?true:false;
              break;
            case 5: //friday
              daySelected = 'friday';
              isWorking = oDataFC.FridayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.FridayIsWorkingDay == 0?true:false;
              break;
            case 6: //saturday
              daySelected = 'saturday';
              isWorking = oDataFC.SaturdayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.SaturdayIsWorkingDay == 0?true:false;
              break;
            case 0: //sunday
              daySelected = 'sunday';
              isWorking = oDataFC.SundayIsWorkingDay == 0 ? 0 : 1;
              //isSelectedDayHoliday=oDataFC.SundayIsWorkingDay == 0?true:false;
              break;
            default:
              break;
          }
        }
        return { isItWorking: isWorking, day: daySelected };
      },
      handleStartDateChange: function (oEvent) {
        //Header Start Date
        var oText = this.byId('sapUiSTART_DATE'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        var selectedDate = this.getDateFromString(sValue);

        //check start date must not be less than so order date
        var SOOrderDate = this.byId('sapUiSO_Order_Date').getValue();
        var dtSOOrderDate = objGlobalThis.getDateFromString(SOOrderDate);

        //check for holiday
        var result = objGlobalThis.checkForFactoryCalendar(selectedDate.getDay());
        if (selectedDate < dtSOOrderDate) {
          this.byId('sapUiSTART_DATE').setValue(null);
          MessageToast.show('Start Date must not be less than SO order date');
        } else if (result['isItWorking'] == 0) {
          //holiday
          this.byId('sapUiSTART_DATE').setValue(null);
          MessageToast.show('Please select working day date');
        } else {
          fltStartDate = sValue;

          var oModel = objGlobalThis.getView().getModel('HeaderListModel');
          var data = oModel.getData();
          data['value'][0].tah_startdate = fltStartDate;
          oModel.setData(data);
          oModel.refresh(true);

          //set planned start - end, actual start - end ***********************************
          var oModel = this.getView().getModel('HeaderListModel');
          var aData = oModel.getData();

          for (let index = 0; index < aData['value'][0]['tactiondetail'].length; index++) {
            const element = aData['value'][0]['tactiondetail'][index];
            if (index == 0) {
              if (screen == 'add') {
                //set planned start date
                element.tahd_plnstdate = sValue;
                //set planned end date after adding days
                var NoOfDays = Number(element.tahd_noofdays);
                var edPlanningDt = this.manipulateDate(sValue, NoOfDays - 1, 'add'); //total days added

                //**************** */
                var st = this.getDateFromString(element.tahd_plnstdate);
                var noOfWeekEnds = this.countweekoffdays(st, edPlanningDt);
                //var noOfWeekEnds = this.countWeekendDays(st, edPlanningDt);
                edPlanningDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edPlanningDt), noOfWeekEnds, 'add');

                edPlanningDt = objGlobalThis.checkForNextDateIsWeekOff(edPlanningDt);
                // //check if end date falls into any holiday/weekoff
                // var result = objGlobalThis.checkForFactoryCalendar(edPlanningDt.getDay());
                // edPlanningDt = (result['isItWorking'] == 0)?this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edPlanningDt), 1, 'add'):edPlanningDt;
                //**************** */

                // if (edPlanningDt.getDay() == 6) {//saturday check
                //     edPlanningDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edPlanningDt), 2, 'add');
                // }
                // if (edPlanningDt.getDay() == 0) {//sunday check
                //     edPlanningDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edPlanningDt), 1, 'add');
                // }
                element.tahd_plneddate = formatter.getDateFromatIn_ddMMyyyy(edPlanningDt);

                //Set Actual Dates
                element.tahd_actstdate = element.tahd_plnstdate;
                element.tahd_acteddate = element.tahd_plneddate;
              } else {
                // only reset actual start end date in case of edit
                //set planned start date
                element.tahd_actstdate = sValue;
                //set planned end date after adding days
                var NoOfDays = Number(element.tahd_noofdays);
                var edActualDt = this.manipulateDate(sValue, NoOfDays - 1, 'add');

                //**************** */
                var st = this.getDateFromString(element.tahd_actstdate);
                var noOfWeekEnds = this.countweekoffdays(st, edActualDt);
                // var noOfWeekEnds = this.countWeekendDays(st, edActualDt);
                edActualDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edActualDt), noOfWeekEnds, 'add');
                //**************** */

                edActualDt = objGlobalThis.checkForNextDateIsWeekOff(edActualDt);
                // if (edActualDt.getDay() == 6) {//saturday
                //     edActualDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edActualDt), 2, 'add');
                // }
                // if (edActualDt.getDay() == 0) {//sunday
                //     edActualDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edActualDt), 1, 'add');
                // }
                element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(edActualDt);
              }

              //get difference between actual end date and planned end date
              //var strPlannedEndDate = element.tahd_plneddate;
              var dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);

              //var strActualEndDate = element.tahd_acteddate;
              var dtfActualEndDate = this.getDateFromString(element.tahd_acteddate);

              const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
              if (diffTimeDelay >= 0) {
                const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
                element.tahd_dldays = diffDaysDelay.toString();
              }
            } else {
              if (screen == 'add') {
                //get previous index
                let PrevIndex = index - 1;
                //get previous data
                let dictPrevData = aData['value'][0]['tactiondetail'][PrevIndex];
                let prevDT = this.getDateFromString(dictPrevData.tahd_plneddate);
                var nextStartDate = this.manipulateDate(dictPrevData.tahd_plneddate, 1, 'add');
                var noOfWeekEnds = this.countweekoffdays(prevDT, nextStartDate);
                nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), noOfWeekEnds, 'add');

                nextStartDate = objGlobalThis.checkForNextDateIsWeekOff(nextStartDate);
                // if (nextStartDate.getDay() == 6) {//saturday
                //     nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), 2, 'add');
                // }
                // if (nextStartDate.getDay() == 0) {//sunday
                //     nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), 1, 'add');
                // }
                element.tahd_plnstdate = formatter.getDateFromatIn_ddMMyyyy(nextStartDate);
                var NoOfDays = Number(element.tahd_noofdays);
                var dtAfterDaysAdded = this.manipulateDate(element.tahd_plnstdate, Number(NoOfDays - 1), 'add');
                //**************** */
                var st = this.getDateFromString(element.tahd_plnstdate);
                var noOfWeekEnds = this.countweekoffdays(st, dtAfterDaysAdded);
                //var noOfWeekEnds = this.countWeekendDays(st, dtAfterDaysAdded);
                dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), noOfWeekEnds, 'add');
                //**************** */

                dtAfterDaysAdded = objGlobalThis.checkForNextDateIsWeekOff(dtAfterDaysAdded);

                // if (dtAfterDaysAdded.getDay() == 0) {//sunday
                //     dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), 1, 'add');
                // }
                // if (dtAfterDaysAdded.getDay() == 6) {//saturday
                //     dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), 2, 'add');
                // }
                element.tahd_plneddate = formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded);

                //Set Actual Dates***********************
                element.tahd_actstdate = element.tahd_plnstdate;
                element.tahd_acteddate = element.tahd_plneddate;
              } else {
                // only reset actual start end date in case of edit
                //get previous index
                let PrevIndex = index - 1;
                //get previous data
                let dictPrevData = aData['value'][0]['tactiondetail'][PrevIndex];
                let prevDT = this.getDateFromString(dictPrevData.tahd_acteddate);
                var nextStartDate = this.manipulateDate(dictPrevData.tahd_acteddate, 1, 'add');
                var noOfWeekEnds = this.countweekoffdays(prevDT, nextStartDate);
                nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), noOfWeekEnds, 'add');

                nextStartDate = objGlobalThis.checkForNextDateIsWeekOff(nextStartDate);
                // if (nextStartDate.getDay() == 6) {//saturday
                //     nextStartDate = this.manipulateDate(sValue, 2, 'add');
                // }
                // if (nextStartDate.getDay() == 0) {//sunday
                //     nextStartDate = this.manipulateDate(sValue, 1, 'add');
                // }
                element.tahd_actstdate = formatter.getDateFromatIn_ddMMyyyy(nextStartDate);
                var NoOfDays = Number(element.tahd_noofdays);
                var dtAfterDaysAdded = this.manipulateDate(element.tahd_actstdate, Number(NoOfDays - 1), 'add');

                //**************** */
                var st = this.getDateFromString(element.tahd_actstdate);
                var noOfWeekEnds = this.countweekoffdays(st, dtAfterDaysAdded);
                //var noOfWeekEnds = this.countWeekendDays(st, dtAfterDaysAdded);
                dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), noOfWeekEnds, 'add');
                //**************** */

                dtAfterDaysAdded = objGlobalThis.checkForNextDateIsWeekOff(dtAfterDaysAdded);

                // if (dtAfterDaysAdded.getDay() == 6) {//saturday
                //     dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), 2, 'add');
                // }
                // if (dtAfterDaysAdded.getDay() == 0) {//sunday
                //     dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), 1, 'add');
                // }
                element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded);
              }

              //get difference between actual end date and planned end date
              //var strPlannedEndDate = element.tahd_plneddate;
              var dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);

              //var strActualEndDate = element.tahd_acteddate;
              var dtfActualEndDate = this.getDateFromString(element.tahd_acteddate);

              const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
              if (diffTimeDelay >= 0) {
                const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
                element.tahd_dldays = diffDaysDelay.toString();
              }
            }
          }
          oModel.setData(aData);
          this.getView().setModel(oModel, 'HeaderListModel');
          oModel.refresh(true);
        }
      },
      // Function to get the smallest positive number
      getSmallestPositiveNumber: function (array, arrDiffBetweenNums) {
        // Extract the 'value' property from the objects and filter positive numbers
        var positiveNumbers = array
          .map(function (obj) {
            return obj;
          })
          .filter(function (value) {
            return value.tempDiff > 0;
          });

        // Return the smallest number from the filtered array
        var min = Math.min.apply(null, arrDiffBetweenNums);
        var result = positiveNumbers.filter(function (num) {
          return num.tempDiff === min;
        });
        return result; //Math.min.apply(null, positiveNumbers);
      },
      findClosestTemplate: function (arr, target) {
        debugger;
        var arrPosDiffBetweenNums = [];
        arr.forEach((element) => {
          var diffDays = target - element['YY1_NoofDays_PPH'];
          element['tempDiff'] = diffDays;
          if (diffDays >= 0) {
            arrPosDiffBetweenNums.push(diffDays);
          }
        });
        var smallestPositiveNumberTemp = objGlobalThis.getSmallestPositiveNumber(arr, arrPosDiffBetweenNums);
        return smallestPositiveNumberTemp;
      },
      sortLineLevelData: function (arr) {
        if (arr) {
          arr.sort(function (a, b) {
            var dayA = parseInt(a.tahd_days.replace('Day ', ''));
            var dayB = parseInt(b.tahd_days.replace('Day ', ''));
            return dayA - dayB;
          });
        }
        return arr;
      },
      mapLineLevelData: function (arr) {
        arr.map(function (currentValue, Index) {
          currentValue.sono = Index + 1;
        });
        return arr;
      },
      populateTemplateForSingle: function (filteredTemplate) {
        this.getView().byId('sapUiPROJECT_TEMPLATE').setValue(filteredTemplate[0].ProjectDescription);
        var oModelH = objGlobalThis.getView().getModel('HeaderListModel');
        var hData = oModelH.getData();
        hData.tah_prjtemplno = filteredTemplate[0].ProjectUUID;
        hData.tah_prjtemplnme = filteredTemplate[0].ProjectDescription;

        fltProjectTemplate = {};
        fltProjectTemplate = {
          ProjectUUID: filteredTemplate[0].ProjectUUID,
          ProjectDescription: filteredTemplate[0].ProjectDescription,
          ProjectManagerUUID: filteredTemplate[0].ProjectManagerUUID
        };
        objGlobalThis.fetchDataAccordingToSelectedProjTemplate(oModelH, hData);
      },

      fetchDataAccordingToSelectedProjTemplate: function (oModel, data) {
        if (fltProjectTemplate != undefined) {
          //enable header start date once project template selected
          objGlobalThis.getView().byId('sapUiSTART_DATE').setEditable(true);

          data['value'][0].tah_prjtemplno = fltProjectTemplate['ProjectUUID'];
          data['value'][0].tah_prjtemplnme = fltProjectTemplate['ProjectDescription'];

          WebService.callEnterpriseProjectChildListAPI(fltProjectTemplate['ProjectUUID']).then(async function (resonse) {
            if (resonse.code == 200) {
              var arr = new Array();
              //ProjectManagerUUID = ParentObjectUUID
              //ProjectElementUUID = ParentObjectUUID
              //ProjectElementUUID = ParentObjectUUID
              let filteredDays = resonse['data']['d']['to_EnterpriseProjectElement']['results'].filter((ele) => {
                return ele.ParentObjectUUID === fltProjectTemplate.ProjectManagerUUID;
              });
              //Days
              for (let j = 0; j < filteredDays.length; j++) {
                let filteredDept = resonse['data']['d']['to_EnterpriseProjectElement']['results'].filter((ele) => {
                  return ele.ParentObjectUUID === filteredDays[j].ProjectElementUUID;
                });
                //Department
                for (let k = 0; k < filteredDept.length; k++) {
                  let filteredPTask = resonse['data']['d']['to_EnterpriseProjectElement']['results'].filter((ele) => {
                    return ele.ParentObjectUUID === filteredDept[k].ProjectElementUUID;
                  });
                  //Task
                  for (let l = 0; l < filteredPTask.length; l++) {
                    const tEle = filteredPTask[l];

                    // tEle.tactiondetailEmpAssign = []

                    var dict = {
                      sono: null,
                      tahd_depcode: filteredDept[k].ProjectElementUUID,
                      tahd_depname: filteredDept[k].ProjectElementDescription.replace('"', '').replace('"', ''),
                      tahd_prjtaskid: tEle.ProjectElementUUID,
                      tahd_prjtaskname: tEle.ProjectElementDescription.replace('"', '').replace('"', ''),
                      tahd_noofdays: null, //intNoOfDays,
                      tahd_days: filteredDays[j].ProjectElementDescription,
                      tahd_plnstdate: null,
                      tahd_plneddate: null,
                      tahd_actstdate: null,
                      tahd_acteddate: null,
                      tahd_dldays: '0',
                      tahd_rescostcentername: tEle.ResponsibleCostCenter,
                      tactionheader_tah_id: resonse['data']['d']['ProjectUUID'],
                      tactiondetailEmpAssign: tEle.tactiondetailEmpAssign //empData['results']
                    };
                    if (tEle.PlannedStartDate != null && tEle.PlannedEndDate != null) {
                      var numPStDt = parseInt(tEle.PlannedStartDate.replace(/[^0-9]/g, ''));
                      var pStDt = new Date(numPStDt);
                      var numPEdDt = parseInt(tEle.PlannedEndDate.replace(/[^0-9]/g, ''));
                      var pEdDt = new Date(numPEdDt);

                      //get difference of planned end date and planned start date - for no of days
                      const dateDiff = Math.abs(pEdDt - pStDt);
                      const noOfDays = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
                      dict.tahd_noofdays = Number(noOfDays) + 1;
                    }
                    arr.push(dict);
                  }
                }
              }

              //Sort array Day Wise
              let sortedArr = objGlobalThis.sortLineLevelData(arr);
              let mappedArr = objGlobalThis.mapLineLevelData(sortedArr);

              data['value'][0].tactiondetail = mappedArr; //arr;
              //task status
              data['value'][0]['tactiondetail'].forEach((element) => {
                element.tahd_tskstatuscode = 'O';
                element.tahd_tskstatusdesc = 'Open';
              });

              oModel.setData(data);
              objGlobalThis.getView().setModel(oModel, 'HeaderListModel');
              oModel.refresh(true);

              var hModel = objGlobalThis.getView().getModel('HeaderListModel');
              var hData = hModel.getData();

              //distinct array based on cost center
              const key = 'tahd_rescostcentername';
              const arrayUniqueByKey = [...new Map(hData['value'][0]['tactiondetail'].map((item) => [item[key], item])).values()];
              debugger;
              //get employee responsible for distinct cost centers
              var arrTempEmpAssign = [];
              for (let index = 0; index < arrayUniqueByKey.length; index++) {
                const element = arrayUniqueByKey[index];
                await WebService.callPersonWorkforceDetail(element.tahd_rescostcentername).then(function (resonse) {
                  if (resonse.code == 200) {
                    debugger;
                    resonse['data']['d']['results'].forEach((eleEmp) => {
                      arrTempEmpAssign.push(eleEmp);
                    });
                  }
                });
              }

              debugger;
              var Index = 0;
              var oTable = objGlobalThis.getView().byId('TATable');
              var aItems = oTable.getItems();
              hData['value'][0]['tactiondetail'].forEach((element) => {
                let filteredData = arrTempEmpAssign.filter((ele) => {
                  return element.tahd_rescostcentername === ele.CostCenter;
                });
                var Arr = [];
                filteredData.forEach((eleEmp) => {
                  var dict = {
                    emp_id: eleEmp.BusinessPartnerUUID,
                    tah_id: null,
                    tahdtl_id: null,
                    emp_code: eleEmp.BusinessPartner,
                    emp_name: eleEmp.BusinessPartnerFullName,
                    tactiondetail_tahd_id: null
                  };
                  Arr.push(dict);
                });
                element.tempEmpAssign = Arr;
                //if employee responsible is single in that case that employee responsible should auto populate in the drodpown.
                if (element.tempEmpAssign.length == 1) {
                  hData['value'][0]['tactiondetail'][Index]['emp_id_UserID'] = element.tempEmpAssign[0]['emp_id'];
                  hData['value'][0]['tactiondetail'][Index]['emp_code'] = element.tempEmpAssign[0]['emp_code'];
                  hData['value'][0]['tactiondetail'][Index]['emp_name'] = element.tempEmpAssign[0]['emp_name'];

                  if (aItems.length > 0 && Index <= aItems.length) {
                    var item = aItems[Index];
                    if (item) {
                      var oComboBox = item.getCells()[11];
                      if (element.emp_id_UserID != null) {
                        oComboBox.setSelectedKey(element.emp_code);
                      }
                    }
                  }
                }

                Index = Index + 1;
              });

              hModel.setData(hData);
              objGlobalThis.getView().setModel(hModel, 'HeaderListModel');
            }
          });
        }
      },
      populateEmpResponsibleForSingle: function () {},
      onDialogCloseAddEdit: async function (_sChannelId, _sEventId, _sData) {
        if (_sChannelId === 'ProjectTempDialogAddEdit') {
          debugger;
          fltProjectTemplate = {};
          fltProjectTemplate = _sData;
          objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setValue(_sData['ProjectDescription']);

          var oModel = objGlobalThis.getView().getModel('HeaderListModel');
          var data = oModel.getData();
          objGlobalThis.fetchDataAccordingToSelectedProjTemplate(oModel, data);
        } else if (_sChannelId === 'SalesOrderDialogAddEdit') {
          fltSONo = _sData;
          objGlobalThis.getView().byId('sapUiSO_NO').setValue(_sData['SalesOrder']);

          var oModel = objGlobalThis.getView().getModel('HeaderListModel');
          var data = oModel.getData();
          data['value'][0].tah_sono = fltSONo['SalesOrder'];

          //so order date
          var strSOOrderDate = fltSONo['SalesOrderDate']; //"/Date(1268524800000)/";
          var numSOStartDate = parseInt(strSOOrderDate.replace(/[^0-9]/g, ''));
          var dtSOOrderDate = new Date(numSOStartDate);
          data['value'][0].tah_sodate = formatter.getDateFromatIn_ddMMyyyy(dtSOOrderDate);
          this.byId('sapUiSO_Order_Date').setValue(data['value'][0].tah_sodate);

          //so delivery date
          var strSODelvDate = fltSONo['RequestedDeliveryDate']; //"/Date(1268524800000)/";
          var numSODelvDate = parseInt(strSODelvDate.replace(/[^0-9]/g, ''));
          var dtSODelvDate = new Date(numSODelvDate);
          data['value'][0].tah_sodeldate = formatter.getDateFromatIn_ddMMyyyy(dtSODelvDate);
          this.byId('sapUiSO_DELIVERY_DATE').setValue(data['value'][0].tah_sodeldate);

          // data['value'][0].tah_soname = fltSONo['tah_soname'];
          oModel.setData(data);
          oModel.refresh(true);

          //filter project template here based on days difference between so order date and so delivery date
          const diffTimeDelay = dtSODelvDate - dtSOOrderDate;
          soDateDifferenceInDay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
          data['value'][0].sodatediff = soDateDifferenceInDay;
          this.byId('sapUiSO_DATE_DIFF').setValue(soDateDifferenceInDay);

          var oModelTemplate = objGlobalThis.getView().getModel('projectTemplateListModel');
          var dataTemplate = oModelTemplate.getData();

          // let length = dataTemplate['results'].length
          var closestTemplates = this.findClosestTemplate(dataTemplate['results'], soDateDifferenceInDay);

          var oDataModel = new sap.ui.model.json.JSONModel({
            results: closestTemplates
          });
          objGlobalThis.getView().setModel(oDataModel, 'templateModel');

          //enable line item in case of add once the SO NO selected
          objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setEditable(true);

          //get sales order line item for selected sales order
          WebService.callSalesOrderLineItemListAPI(fltSONo['SalesOrder']).then(function (resonse) {
            if (resonse.code == 200) {
              var oModel = objGlobalThis.getView().getModel('salesOrderLineItemListModel');
              oModel.setData(resonse['data']['d']);
              objGlobalThis.getView().setModel(oModel, 'salesOrderLineItemListModel');
            }
          });
        } else if (_sChannelId === 'SalesOrderLineItemDialogAddEdit') {
          fltSONoLineNo = _sData;

          soLineItemCategory = fltSONoLineNo['AdditionalMaterialGroup1'];
          //filter project template here based on category retrived based on selected so line item
          var oModelTemplate = objGlobalThis.getView().getModel('templateModel'); //projectTemplateListModel
          var dataTemplate = oModelTemplate.getData();
          if (dataTemplate['results'].length > 0) {
            let filteredTemplate = dataTemplate['results'].filter((ele) => {
              return ele.YY1_Category1_PPH === soLineItemCategory;
            });

            var oDataModel = new sap.ui.model.json.JSONModel({
              results: filteredTemplate
            });
            if (filteredTemplate.length == 1) {
              this.populateTemplateForSingle(filteredTemplate);
            }
            objGlobalThis.getView().setModel(oDataModel, 'templateModel');
          }

          objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE').setEditable(true);
          objGlobalThis.getView().byId('sapUiSO_LINEITEM_NO').setValue(_sData['SalesOrderItemText']);

          var oModel = objGlobalThis.getView().getModel('HeaderListModel');
          var data = oModel.getData();
          data['value'][0].tah_lineno = fltSONoLineNo['SalesOrderItem'];
          data['value'][0].tah_itemcode = fltSONoLineNo['SalesOrderItem'];
          data['value'][0].tah_itemdesc = fltSONoLineNo['SalesOrderItemText'];
          data['value'][0].tah_soitemcategory = soLineItemCategory != undefined ? soLineItemCategory : null;
          oModel.setData(data);
          oModel.refresh(true);
        }
      },

      //Line Level
      onTblItemClick: function (oEvent) {},
      handleRowClick: function (oEvent) {},
      handleActualStartDateChange: function (oEvent) {
        var oText = this.byId('sapUiACT_START_DATE'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
        var oModel = this.getView().getModel('HeaderListModel'); //
        var aData = oModel.getData();
        let element = aData['value'][0].tactiondetail[index];

        var PlannedStartDateFromString;
        if (screen == 'edit') {
          PlannedStartDateFromString = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
        } else {
          PlannedStartDateFromString = this.getDateFromString(element.tahd_plnstdate);
        }
        var ActualStartDateFromString = this.getDateFromString(sValue);

        var result = objGlobalThis.checkForFactoryCalendar(ActualStartDateFromString.getDay());
        if (result['isItWorking'] == 0) {
          //holiday
          element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          var NoOfDays = Number(element.tahd_noofdays);

          var st;
          var dtfActualEndDate;
          if (screen == 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate),
              NoOfDays - 1,
              'add'
            ); //sValue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_plnstdate, NoOfDays - 1, 'add'); //sValue
            st = this.getDateFromString(element.tahd_plnstdate);
          }

          var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = objGlobalThis.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var IsWeekOffDay = objGlobalThis.checkForFactoryCalendar(dtfActualEndDate.getDay());
          // dtfActualEndDate=IsWeekOffDay['isItWorking']==0 ? this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), 1, 'add') : dtfActualEndDate;

          // var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);
          MessageToast.show('Please select working day date');
        } else if (ActualStartDateFromString < PlannedStartDateFromString) {
          element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          var NoOfDays = Number(element.tahd_noofdays);
          var st;
          var dtfActualEndDate;
          if (screen == 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate),
              NoOfDays - 1,
              'add'
            ); //svalue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_plnstdate, NoOfDays - 1, 'add'); //svalue
            st = this.getDateFromString(element.tahd_plnstdate);
          }
          var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = objGlobalThis.checkForNextDateIsWeekOff(dtfActualEndDate);

          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          MessageToast.show('Actual Start Date should be greater than or equal to Planned Start Date');
        } else {
          //get actual end date after adding days to actual start date
          var NoOfDays = Number(element.tahd_noofdays);

          var dtfActualEndDate = this.manipulateDate(sValue, NoOfDays - 1, 'add');

          var st = this.getDateFromString(sValue);
          var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = objGlobalThis.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          //get difference between actual end date and planned end date
          //var strPlannedEndDate = element.tahd_plneddate;
          var dtfPlannedEndDate;
          if (screen == 'edit') {
            dtfPlannedEndDate = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plneddate));
          } else {
            dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);
          }

          //get difference and delay days
          const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            element.tahd_dldays = diffDaysDelay.toString();
          }

          oModel.setData(aData);
          this.getView().setModel(oModel, 'HeaderListModel');
          oModel.refresh(true);
        }
      },
      handleActualEndDateChange: function (oEvent) {
        var oText = this.byId('sapUiACT_END_DATE'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
        var oModel = this.getView().getModel('HeaderListModel');
        var aData = oModel.getData();
        let element = aData['value'][0].tactiondetail[index];

        //var selectedDate = this.getDateFromString(sValue);
        var ActualStartDateFromString;
        if (screen == 'edit') {
          ActualStartDateFromString = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
        } else {
          ActualStartDateFromString = this.getDateFromString(element.tahd_actstdate);
        }
        var ActualEndDateFromString = this.getDateFromString(sValue);
        var dtfActualEndDate;
        var result = objGlobalThis.checkForFactoryCalendar(ActualEndDateFromString.getDay());
        if (result['isItWorking'] == 0) {
          //holiday
          //element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          var NoOfDays = Number(element.tahd_noofdays);
          var st;
          if (screen == 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate),
              NoOfDays - 1,
              'add'
            ); //sValue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_actstdate, NoOfDays - 1, 'add'); //sValue
            st = this.getDateFromString(element.tahd_actstdate);
          }

          var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = objGlobalThis.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);
          MessageToast.show('Please select working day date');
        } else if (ActualEndDateFromString < ActualStartDateFromString) {
          //element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          var NoOfDays = Number(element.tahd_noofdays);

          var st;
          if (screen == 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate),
              NoOfDays - 1,
              'add'
            ); //svalue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_actstdate, NoOfDays - 1, 'add'); //svalue
            st = this.getDateFromString(element.tahd_actstdate);
          }

          var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = objGlobalThis.checkForNextDateIsWeekOff(dtfActualEndDate);
          // //check for factory cal
          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          MessageToast.show('Actual End Date should be greater than or equal to Actual Start Date');
        } else {
          //convert actual end date to date
          dtfActualEndDate = this.getDateFromString(sValue);
        }

        //get planned end date and convert to date
        //var strPlannedEndDate = element.tahd_plneddate;
        var dtfPlannedEndDate;
        if (screen == 'edit') {
          dtfPlannedEndDate = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plneddate));
        } else {
          dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);
        }

        //get difference and delay days
        const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
        if (diffTimeDelay >= 0) {
          const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
          element.tahd_dldays = diffDaysDelay.toString();
        }

        oModel.setData(aData);
        this.getView().setModel(oModel, 'HeaderListModel');
        oModel.refresh(true);
      },
      onTaskStatusChangefunction: function (oEvent) {
        var selText = oEvent.getParameter('selectedItem').getText();
        var selKey = oEvent.getParameter('selectedItem').getKey();

        var index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        // hModel.attachRequestCompleted(function () {
        var oModel = this.getView().getModel('HeaderListModel');
        var aData = oModel.getData();

        aData['value'][0]['tactiondetail'][index]['tahd_tskstatuscode'] = selKey;
        aData['value'][0]['tactiondetail'][index]['tahd_tskstatusdesc'] = selText;

        debugger;
        if (roleInfo['RoleCode'] == 'TAUser' && selKey == 'CL') {
          //current date
          var oDate = new Date();
          var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: 'dd-MM-yyyy'
          });
          // Format the date
          var sFormattedDate = oDateFormat.format(oDate);
          aData['value'][0]['tactiondetail'][index]['tahd_acteddate'] = sFormattedDate;

          var dtfPlannedEndDate = objGlobalThis.getDateFromString(aData['value'][0]['tactiondetail'][index]['tahd_plneddate']);
          //get difference and delay days
          const diffTimeDelay = oDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            aData['value'][0]['tactiondetail'][index]['tahd_dldays'] = diffDaysDelay.toString();
          }
        } else if (roleInfo['RoleCode'] == 'TAUser' && selKey != 'CL') {
          //actual end date
          aData['value'][0]['tactiondetail'][index]['tahd_acteddate'] =
            aData['value'][0]['tactiondetail'][index]['tahd_plneddate'];

          var dtfActualEndDate = objGlobalThis.getDateFromString(aData['value'][0]['tactiondetail'][index]['tahd_acteddate']);
          var dtfPlannedEndDate = objGlobalThis.getDateFromString(aData['value'][0]['tactiondetail'][index]['tahd_plneddate']);
          //get difference and delay days
          const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            aData['value'][0]['tactiondetail'][index]['tahd_dldays'] = diffDaysDelay.toString();
          }
        }

        oModel.setData(aData);
        this.getView().setModel(oModel, 'HeaderListModel');
        oModel.refresh(true);
      },
      enableOnlyNextRow: function (iindex) {
        var oTable = objGlobalThis.getView().byId('TATable');
        var aItems = oTable.getItems();
        var cellId = aItems[iindex].getAggregation('cells')[12].getId();
        var cellObj = sap.ui.getCore().byId(cellId);
        //remarks
        var cellIdRem = aItems[iindex].getAggregation('cells')[13].getId();
        var cellObjRem = sap.ui.getCore().byId(cellIdRem);

        cellObj.setEditable(true);
        cellObjRem.setEditable(true);
      },
      //Date calculation *********************************
      manipulateDate: function (date, days, operation) {
        //dd/MM/yyyy
        var arr;
        var nDate;
        if (date.indexOf('-') > -1) {
          arr = date.split('-');
        } else if (date.indexOf('/') > -1) {
          arr = date.split('/');
        }
        if (arr != undefined) {
          var year = Number(arr[2]);
          var month = Number(arr[1]);
          var day = Number(arr[0]);
          var str = year + ',' + month + ',' + day;
          nDate = new Date(str);
          // nDate = new Date(year,month,day);
        }

        if (nDate != undefined) {
          if (operation === 'sub') {
            nDate.setDate(nDate.getDate() - days);
          } else if (operation === 'add') {
            nDate.setDate(nDate.getDate() + days);
          }
        }
        console.log(nDate);
        return nDate;
      },
      getDateFromString(date) {
        //dd/mm/yyyy
        var arr;
        var nDate;

        if (date != undefined) {
          if (date.indexOf('-') > -1) {
            arr = date.split('-');
          } else if (date.indexOf('/') > -1) {
            arr = date.split('/');
          }
          if (arr != undefined) {
            if (arr[0].length <= 2) {
              //dd/mm/yyyy
              var year = Number(arr[2]);
              var month = Number(arr[1]);
              var day = Number(arr[0]);
              var str = year + ',' + month + ',' + day;
              nDate = new Date(str);
            } else if (arr[0].length > 2) {
              //yyyy/mm/dd
              var year = Number(arr[0]);
              var month = Number(arr[1]);
              var day = Number(arr[2]);
              var str = year + ',' + month + ',' + day;
              nDate = new Date(str);
            }

            // nDate = new Date(year,month,day);
          }
        }
        return nDate;
      },
      checkForNextDateIsWeekOff: function (dtToCheck) {
        var dtToReturn;
        var IsWeekOffDay = objGlobalThis.checkForFactoryCalendar(dtToCheck.getDay());
        if (IsWeekOffDay['isItWorking'] == 1) {
          //working
          return (dtToReturn = dtToCheck);
        } else {
          dtToReturn = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtToCheck/*dtfActualEndDate*/), 1, 'add');
        }
        objGlobalThis.checkForNextDateIsWeekOff(dtToReturn);
      },
      //Validation*********************************
      isFormValid: function () {
        var isValid = true;
        var valSoNo = this.getView().byId('sapUiSO_NO').getValue();
        var valSoLineItemNo = this.getView().byId('sapUiSO_LINEITEM_NO').getValue();
        var valProjTemp = this.getView().byId('sapUiPROJECT_TEMPLATE').getValue();
        var valStDt = this.getView().byId('sapUiSTART_DATE').getValue();
        var valProjStatus = this.getView().byId('sapUiPROJECT_STATUS').getSelectedItem();

        if (
          (valSoNo == undefined || valSoNo == null || valSoNo == '') &&
          (valSoLineItemNo == undefined || valSoLineItemNo == null || valSoLineItemNo == '') &&
          (valProjTemp == undefined || valProjTemp == null || valProjTemp == '') &&
          (valStDt == undefined || valStDt == null || valStDt == '') &&
          (valProjStatus == undefined || valProjStatus == null || valProjStatus == '')
        ) {
          isValid = false;
          MessageToast.show('All header selection is mandatory, Please select header data!');
          return isValid;
        } else if (valSoNo == undefined || valSoNo == null || valSoNo == '') {
          isValid = false;
          MessageToast.show('Please select So No!');
          return isValid;
        } else if (valSoLineItemNo == undefined || valSoLineItemNo == null || valSoLineItemNo == '') {
          isValid = false;
          MessageToast.show('Please select So Line Item No!');
          return isValid;
        } else if (valProjTemp == undefined || valProjTemp == null || valProjTemp == '') {
          isValid = false;
          MessageToast.show('Please select Project Template');
          return isValid;
        } else if (valStDt == undefined || valStDt == null || valStDt == '') {
          isValid = false;
          MessageToast.show('Please select Start Date!');
          return isValid;
        } else if (
          roleInfo['RoleCode'] == 'TAAdmin' &&
          (valProjStatus == undefined || valProjStatus == null || valProjStatus == '')
        ) {
          isValid = false;
          MessageToast.show('Please select Project Status!');
          return isValid;
        } else if (roleInfo['RoleCode'] == 'TAAdmin') {
          //user
          var oModel = objGlobalThis.getView().getModel('HeaderListModel');
          var oData = oModel.getData();

          // let filteredDataStatus = oData['value'][0]['tactiondetail'].filter((ele) => {
          //     return (ele.tahd_tskstatuscode == "CL" && (ele.tahd_comments == undefined || ele.tahd_comments == "" || ele.tahd_comments == null));
          // });

          let filteredDataDelay = oData['value'][0]['tactiondetail'].filter((ele) => {
            return (
              (Number(ele.tahd_dldays) > 0 || Number(ele.tahd_dldays) < 0) &&
              (ele.tahd_admincomments == undefined || ele.tahd_admincomments == '' || ele.tahd_admincomments == null)
            );
          });

          if (filteredDataDelay.length > 0) {
            if (filteredDataDelay[0]['tahd_admincomments'] == null) {
              MessageToast.show('Please enter remarks for Delay days');
              isValid = false;
            }
          }
          // else if (filteredDataStatus.length > 0) {
          //     MessageToast.show("Please enter remarks for status Close");
          //     isValid = false;
          // }
        } else {
          /*var oModel = objGlobalThis.getView().getModel("HeaderListModel");
                                        var oData = oModel.getData();
                                
                                        for (let index = 0; index < oData['value'][0]['tactiondetail'].length; index++) {
                                            const element = oData['value'][0]['tactiondetail'][index];
                                            if (element.tempEmpAssign === undefined) {
                                                MessageToast.show("Please select Employee Responsible for " + element.tahd_depname + "!");
                                                isValid = false;
                                                break;
                                            }
                                        }*/
        }
        return isValid;
      },
      //Save Time And Action
      onAddUpdateData: function () {
        if (objGlobalThis.isFormValid()) {
          objGlobalThis.onSaveEditClicked();
        }
      },
      isDateValid: function (dateStr) {
        return !isNaN(new Date(dateStr));
      },
      onSaveEditClicked: function () {
        var oModelH = objGlobalThis.getView().getModel('HeaderListModel');
        var hData = oModelH.getData();

        var tActionDetailArr = new Array();

        if (roleInfo['RoleCode'] == 'TAUser') {
          let filteredDetailData = hData['value'][0].tactiondetail.filter((ele) => {
            return ele.editable == true;
          });
          hData['value'][0].tactiondetail = filteredDetailData;
        }
        hData['value'][0].tactiondetail.forEach((element) => {
          // var empRespArr = []
          // if (element.tactiondetailEmpAssign != undefined) {
          //     element.tactiondetailEmpAssign.forEach(ele => {
          //         var eDict = {
          //             // "emp_id": ele.emp_id,
          //             // "tah_id": ele.tah_id,
          //             // "tahdtl_id": ele.tahdtl_id,
          //             emp_id: ele.emp_id,
          //             emp_code: ele.emp_code,
          //             emp_name: ele.emp_name
          //             // "tactiondetail_tahd_id": ele.tactiondetail_tahd_id
          //         }
          //         empRespArr.push(eDict)
          //     })
          // }

          //Planned date ****************************
          var pStDt;
          var pEdDt;
          var dfsPlannedStDt;
          var dfsPlannedEnDt;

          if (screen == 'edit') {
            let dtSt = new Date(element.tahd_plnstdate);
            pStDt = formatter.getDateFromatIn_yyyyMMdd(dtSt);
            let dtEd = new Date(element.tahd_plneddate);
            pEdDt = formatter.getDateFromatIn_yyyyMMdd(dtEd);
          } else {
            dfsPlannedStDt = this.getDateFromString(element.tahd_plnstdate);
            dfsPlannedEnDt = this.getDateFromString(element.tahd_plneddate);
            if (this.isDateValid(dfsPlannedStDt)) {
              pStDt = formatter.getDateFromatIn_yyyyMMdd(dfsPlannedStDt);
            }
            if (this.isDateValid(dfsPlannedEnDt)) {
              pEdDt = formatter.getDateFromatIn_yyyyMMdd(dfsPlannedEnDt);
            }
          }

          //Actual date ****************************
          var aStDt;
          var aEdDt;
          var dfsActualStDt;
          var dfsActualEnDt;
          if (fltStartDate != undefined) {
            if (screen == 'edit') {
              let dtSt = objGlobalThis.getDateFromString(element.tahd_actstdate);
              //let dtSt = new Date(formatter.getDateFromatIn_yyyyMMdd(element.tahd_actstdate));
              aStDt = formatter.getDateFromatIn_yyyyMMdd(dtSt);
              let dtEd = objGlobalThis.getDateFromString(element.tahd_acteddate);
              // let dtEd = new Date(formatter.getDateFromatIn_yyyyMMdd(element.tahd_acteddate));
              aEdDt = formatter.getDateFromatIn_yyyyMMdd(dtEd);

              // aStDt = formatter.getDateFromatIn_yyyyMMdd(element.tahd_actstdate);
              // aEdDt = formatter.getDateFromatIn_yyyyMMdd(element.tahd_acteddate);
              // aStDt = element.tahd_actstdate;//this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
              // aEdDt = element.tahd_acteddate;//this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_acteddate));
            } else {
              dfsActualStDt = this.getDateFromString(element.tahd_actstdate);
              dfsActualEnDt = this.getDateFromString(element.tahd_acteddate);
              if (this.isDateValid(dfsActualStDt)) {
                aStDt = formatter.getDateFromatIn_yyyyMMdd(dfsActualStDt);
              }
              if (this.isDateValid(dfsActualEnDt)) {
                aEdDt = formatter.getDateFromatIn_yyyyMMdd(dfsActualEnDt);
              }
            }
          } else {
            let dtSt = objGlobalThis.getDateFromString(element.tahd_actstdate);
            aStDt = formatter.getDateFromatIn_yyyyMMdd(dtSt);
            let dtEd = objGlobalThis.getDateFromString(element.tahd_acteddate);
            aEdDt = formatter.getDateFromatIn_yyyyMMdd(dtEd);

            // aStDt = element.tahd_actstdate;
            // aEdDt = element.tahd_acteddate;
            // let dtSt = new Date(formatter.getDateFromatIn_yyyyMMdd(element.tahd_actstdate));
            // aStDt = formatter.getDateFromatIn_yyyyMMdd(dtSt);
            // let dtEd = new Date(formatter.getDateFromatIn_yyyyMMdd(element.tahd_acteddate));
            // aEdDt = formatter.getDateFromatIn_yyyyMMdd(dtEd);
          }

          var dict = {
            tahd_id: element.tahd_id,
            tah_id: element.tah_id,
            tahd_depcode: element.tahd_depcode,
            tahd_depname: element.tahd_depname,
            tahd_prjtaskid: element.tahd_prjtaskid,
            tahd_prjtaskname: element.tahd_prjtaskname,
            tahd_noofdays: element.tahd_noofdays.toString(),
            tahd_days: element.tahd_days,
            tahd_plnstdate: pStDt,
            tahd_plneddate: pEdDt,
            tahd_actstdate: aStDt,
            tahd_acteddate: aEdDt,
            tahd_dldays: element.tahd_dldays,
            tahd_tskstatuscode:
              element.tahd_tskstatuscode != undefined && element.tahd_tskstatuscode != '-1' ? element.tahd_tskstatuscode : null,
            tahd_tskstatusdesc:
              element.tahd_tskstatusdesc != undefined && element.tahd_tskstatusdesc != 'Select Task Status'
                ? element.tahd_tskstatusdesc
                : null,
            tahd_comments: element.tahd_comments,
            tahd_admincomments: element.tahd_admincomments,
            // tactionheader_tah_id: element.tactionheader_tah_id,
            tahd_rescostcentercode: element.tahd_rescostcentername,
            tahd_rescostcentername: element.tahd_rescostcentername,
            //tactiondetailEmpAssign: empRespArr
            emp_id_UserID: element.emp_id_UserID,
            emp_code: element.emp_code,
            emp_name: element.emp_name
          };
          tActionDetailArr.push(dict);
        });

        var SOOrderDT, SODelDT;
        if (screen == 'edit') {
          SOOrderDT = formatter.getDateFromatIn_yyyyMMdd(hData['value'][0].tah_sodate);
          SODelDT = formatter.getDateFromatIn_yyyyMMdd(hData['value'][0].tah_sodeldate);
        } else {
          var dfSOOrderDT = this.getDateFromString(hData['value'][0].tah_sodate); //tah_so_start_date
          var dfSODelDT = this.getDateFromString(hData['value'][0].tah_sodeldate);
          if (this.isDateValid(dfSOOrderDT)) {
            SOOrderDT = formatter.getDateFromatIn_yyyyMMdd(dfSOOrderDT);
          }
          if (this.isDateValid(dfSODelDT)) {
            SODelDT = formatter.getDateFromatIn_yyyyMMdd(dfSODelDT);
          }
        }

        if (roleInfo['RoleCode'] == 'TAUser') {
          var body = tActionDetailArr[0];
          var tahd_id = body['tahd_id'];
          delete body['tahd_id'];
          delete body['tah_id'];
          //   delete body['tactionheader_tah_id']
          WebService.updateTActionDetailForTAUser(body, 'PATCH', tahd_id).then(function (response) {
            if (response.code == 200 || response.code == 201) {
              MessageToast.show('Time And Action updated successfully for T&A no ' + response.data.tah_no);
              setTimeout(
                function () {
                  objGlobalThis.navBack();
                  //objGlobalThis.getRouter().navTo('RouteNameSearchTimeAndAction')
                }.bind(this),
                500
              );
            } else {
              MessageToast.show(response.msg);
            }
          });
        } else {
          var body = {
            tah_sono: hData['value'][0].tah_sono != undefined ? hData['value'][0].tah_sono : null,
            tah_lineno: hData['value'][0].tah_lineno != undefined ? hData['value'][0].tah_lineno : null,
            tah_itemcode: hData['value'][0].tah_itemcode != undefined ? hData['value'][0].tah_itemcode : null,
            tah_itemdesc: hData['value'][0].tah_itemdesc != undefined ? hData['value'][0].tah_itemdesc : null,
            tah_prjtemplno: hData['value'][0].tah_prjtemplno != undefined ? hData['value'][0].tah_prjtemplno : null,
            tah_prjtemplnme: hData['value'][0].tah_prjtemplnme != undefined ? hData['value'][0].tah_prjtemplnme : null,
            tah_prjtempdesc: hData['value'][0].tah_prjtempdesc != undefined ? hData['value'][0].tah_prjtempdesc : null,
            tah_startdate: hData['value'][0].tah_startdate != undefined ? hData['value'][0].tah_startdate : null,
            tah_prjstatuscode:
              hData['value'][0].tah_prjstatuscode != undefined && hData['value'][0].tah_prjstatuscode != '-1'
                ? hData['value'][0].tah_prjstatuscode
                : null,
            tah_prjstatusname:
              hData['value'][0].tah_prjstatusname != undefined && hData['value'][0].tah_prjstatusname != 'Select Project Status'
                ? hData['value'][0].tah_prjstatusname
                : null,
            tah_sodate: SOOrderDT,
            tah_sodeldate: SODelDT,
            tah_soitemcategory: soLineItemCategory,
            tah_isactive: 'Y',
            tah_isdeleted: 'N',
            tah_addbyEmpid: loginInfo['UserID'],
            tah_addbyEmpCode: loginInfo['Usercode'],
            tah_addbyUsername: loginInfo['Username'],
            tactiondetail: tActionDetailArr //hData['value'][0].tactiondetail//aData['value']
          };
          var dfsStDt = this.getDateFromString(body.tah_startdate);
          if (this.isDateValid(dfsStDt)) {
            body.tah_startdate = formatter.getDateFromatIn_yyyyMMdd(dfsStDt);
          }

          delete body['isEnabled'];
          //  delete body['tactionheader_tah_id']
          if (screen == 'add') {
            delete body['tah_id'];
            WebService.saveUpdateTimeAndAction(body, 'POST').then(function (response) {
              if (response.code == 200 || response.code == 201) {
                MessageToast.show('Time And Action added successfully for T&A no ' + response.data.tah_no);
                setTimeout(
                  function () {
                    objGlobalThis.getRouter().navTo('RouteNameSearchTimeAndAction');
                  }.bind(this),
                  500
                );
              } else {
                MessageToast.show(response.msg);
              }
            });
          } else {
            body['tah_id'] = hData['value'][0].tah_id != undefined ? hData['value'][0].tah_id : null;

            WebService.saveUpdateTimeAndAction(body, 'PATCH', TH_ID).then(function (response) {
              if (response.code == 200 || response.code == 201) {
                MessageToast.show('Time And Action updated successfully for T&A no ' + response.data.tah_no);
                setTimeout(
                  function () {
                    objGlobalThis.navBack();
                    //objGlobalThis.getRouter().navTo('RouteNameSearchTimeAndAction')
                  }.bind(this),
                  500
                );
              } else {
                MessageToast.show(response.msg);
              }
            });
          }
        }
      },
      onPressLogout: function () {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.put(null);

        sap.ui.getCore().getEventBus().publish('Logout', 'rowSelectEvent', '');
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo('RouteNameLogin', {}, true);

        // const oHistory = History.getInstance();
        // const sPreviousHash = oHistory.getPreviousHash();

        // if (sPreviousHash !== undefined) {
        //     window.history.go(-1);
        // } else {
        //     const oRouter = this.getOwnerComponent().getRouter();
        //     oRouter.navTo("RouteNameLogin", {}, true);
        // }
      }
    });
  }
);
