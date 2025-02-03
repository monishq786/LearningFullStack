sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core',
    '../model/formatter',
    '../model/Constants',
    'sap/ui/core/format/DateFormat',
    '../service/WebService',
    'sap/ui/core/Fragment',
    './CFLDialog.controller',
    'sap/ui/core/routing/History',
    'sap/ui/core/UIComponent',
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library'
  ],
  function (
    Controller,
    JSONModel,
    Core,
    formatter,
    DateFormat,
    Constants,
    WebService,
    Fragment,
    CFLDialog,
    History,
    UIComponent,
    Spreadsheet,
    exportLibrary
  ) {
    'use strict';
    var objGlobalThis;

    var fltSONo;
    var fltProjectTemplate;
    var fltProjectStatus;
    var fltStartDate;
    var loginInfo;
    var roleInfo;
    var EdmType = exportLibrary.EdmType;
    return Controller.extend('stoneman.controller.SearchTimeAndActionForm', {
      onInit: function () {
        // if (sap.ushell.Container.getRenderer("fiori2")) {
        //     sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(false, true);
        // }
        objGlobalThis = this;
        this.getView().addEventDelegate(
          {
            onBeforeShow: this.onBeforeShow,
            onAfterShow: this.onAfterShow
          },
          this
        );

        sap.ui.getCore().getEventBus().subscribe('ProjectTempDialogSearch', 'rowSelectEvent', this.onDialogCloseSearch, this);
        sap.ui.getCore().getEventBus().subscribe('SalesOrderDialogSearch', 'rowSelectEvent', this.onDialogCloseSearch, this);

        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute('RouteNameSearchTimeAndAction').attachMatched(this.onRouteMatched, this);

        //disable date pickers
        this.disableInputInDatePickers();

        //setProperty
        objGlobalThis.setPropertyManualy();

        //set Model default data blank json
        this.setModelData();
      },

      onRouteMatched: function (oEvent) {
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        roleInfo = lstorage.get('role_details');
        loginInfo = lstorage.get('login_info');

        var btnAddNew = objGlobalThis.getView().byId('sapUiBtnAddNew');
        if (roleInfo['RoleCode'] == 'TAAdmin') {
          btnAddNew.setVisible(true);
        } else {
          btnAddNew.setVisible(false);
        }

        this.myName = loginInfo['Username'];
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, 'view');
      },
      onAfterShow: function () {
        //onAfterRendering: function () {
        console.log('After Rendering called');
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        roleInfo = lstorage.get('role_details');
        loginInfo = lstorage.get('login_info');

        objGlobalThis.setByDefaultInProgress();
      },
      onExit() {
        sap.ui.getCore().getEventBus().unsubscribe('ProjectTempDialogSearch', 'rowSelectEvent', this.onDialogCloseSearch, this);
        sap.ui.getCore().getEventBus().unsubscribe('SalesOrderDialogSearch', 'rowSelectEvent', this.onDialogCloseSearch, this);
      },
      onLiveChange: function (oEvent) {
        // Prevent user from typing into the input field
        const oInput = oEvent.getSource();
        oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
      },
      disableInputInDatePickers: function () {
        //Start Date
        var oDatePickerST = this.getView().byId('sapUiSTART_DATE_Search');
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
      },
      setPropertyManualy: function () {
        //Set Property
        var sapUiTA_NO = this.getView().byId('sapUiTA_NO_Search');
        sapUiTA_NO.setValueHelpOnly(true);
        var sapUiPROJECT_TEMPLATE = this.getView().byId('sapUiPROJECT_TEMPLATE_Search');
        sapUiPROJECT_TEMPLATE.setValueHelpOnly(true);
        var sapUiSO_NO = this.getView().byId('sapUiSO_NO_Search');
        sapUiSO_NO.setValueHelpOnly(true);
      },
      getRouter: function () {
        //Routing
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
      navBack: function () {
        // this.getRouter().navTo("RouteLanding");
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo('RouteNameLanding', {}, true);
        }
      },
      setByDefaultInProgress: function () {
        objGlobalThis.byId('sapUiPROJECT_STATUS_Search').setSelectedKey('O');
        fltProjectStatus = 'O';
        objGlobalThis.onSearchButtonAction();
      },
      setModelData: function () {
        //Model
        //project status
        var sPathPS = jQuery.sap.getModulePath('stoneman', '/model/ST_ProjectStatusModel.json');
        var oModelPS = new sap.ui.model.json.JSONModel(sPathPS);
        objGlobalThis.getView().setModel(oModelPS, 'projectStatusModel');

        WebService.getProjectStatus().then(function (resonse) {
          debugger;
          if (resonse.code == 200) {
            var dict = {
              prj_id: '-1',
              prjstatus_code: '-1',
              prjstatus_name: 'Select Project Status'
            };
            resonse['data']['value'].splice(0, 0, dict);
            var oModel = objGlobalThis.getView().getModel('projectStatusModel');
            oModel.setData(resonse['data']);
            objGlobalThis.getView().setModel(oModel, 'projectStatusModel');
          }
        });

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

        //Project Template
        var sPathSO = jQuery.sap.getModulePath('stoneman', '/model/ST_ProjectTemplateListModel.json');
        var oModelSO = new sap.ui.model.json.JSONModel(sPathSO);
        objGlobalThis.getView().setModel(oModelSO, 'projectTemplateListModel');
        WebService.callEnterpriseProjectListAPI().then(function (resonse) {
          if (resonse.code == 200) {
            var oModel = objGlobalThis.getView().getModel('projectTemplateListModel');
            oModel.setData(resonse['data']['d']);
            objGlobalThis.getView().setModel(oModel, 'projectTemplateListModel');
          }
        });

        //headerlist
        var sPathTbl = jQuery.sap.getModulePath('stoneman', '/model/ST_SearchHeaderListModel.json');
        var oModelTbl = new sap.ui.model.json.JSONModel(sPathTbl);
        objGlobalThis.getView().setModel(oModelTbl, 'HeaderListModel');

        //Time And action no
        objGlobalThis.getView().setModel(oModelTbl, 'TimeAndActionNoListModel');
        WebService.getTimeAndActionNoList().then(function (response) {
          if (response.code == 200) {
            debugger;
            var oModel = objGlobalThis.getView().getModel('TimeAndActionNoListModel');
            response['data']['value'].forEach((element) => {
              element.tah_sodeldate = formatter.getDateFromatIn_ddMMyyyy(element.tah_sodeldate);
            });
            oModel.setData(response['value']);
            objGlobalThis.getView().setModel(oModel, 'TimeAndActionNoListModel');
          }
        });
      },

      //Button ****************************************
      onClearSearchButtonAction: function () {
        //Clear Search Button
        objGlobalThis.getView().byId('sapUiSTART_DATE_Search').setValue(null);
        objGlobalThis.getView().byId('sapUiSO_NO_Search').setValue(null);
        objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE_Search').setValue(null);
        fltSONo = undefined;
        fltProjectTemplate = undefined;
        fltStartDate = undefined;
        var hModel = objGlobalThis.getView().getModel('HeaderListModel');
        var data = [];
        hModel.setData({ value: data });
        hModel.refresh(true);
      },
      onSearchButtonAction: function () {
        //Search Button
        //header list
        var filter = undefined;
        if (fltSONo != undefined) {
          //So No
          if (filter == undefined) {
            filter = 'tah_sono eq ' + "'" + fltSONo + "'";
          } else {
            filter = filter + ' and tah_sono eq ' + "'" + fltSONo + "'";
          }
        }
        if (fltProjectTemplate != undefined) {
          //Project Template
          if (filter == undefined) {
            filter = 'tah_prjtemplno eq ' + "'" + fltProjectTemplate + "'";
          } else {
            filter = filter + ' and tah_prjtemplno eq ' + "'" + fltProjectTemplate + "'";
          }
        }
        if (fltStartDate != undefined) {
          //Start Date
          if (filter == undefined) {
            filter = 'tah_startdate eq ' + fltStartDate;
          } else {
            filter = filter + ' and tah_startdate eq ' + fltStartDate;
          }
        }
        if (fltProjectStatus != undefined && fltProjectStatus != '-1') {
          //Project Status
          if (filter == undefined) {
            filter = 'tah_prjstatuscode eq ' + "'" + fltProjectStatus + "'";
          } else {
            filter = filter + ' and tah_prjstatuscode eq ' + "'" + fltProjectStatus + "'";
          }
        }

        if (filter != undefined) {
          WebService.getSearchHeaderList(filter, loginInfo['UserID'], roleInfo['RoleCode']).then(function (resonse) {
            if (resonse.code == 200) {
              objGlobalThis.bindDataToModel(resonse['data']);
            }
          });
        }
      },
      onAddButtonAction: function () {
        //Add Button
        this.getRouter().navTo('RouteNameAddEditTimeAndAction', { data: '-1' });
      },
      //Dialog ****************************************
      handleTA_NO: async function (oEvent) {
        // var oView = this.getView();
        // var obji18n = oView.getModel("i18n").getResourceBundle();
        // var dialog = new CFLDialog(oView, obji18n.getText("TANO"), 'search');//TANO
        // await dialog.open();

        var data;
        var oView = this.getView();
        var oModel = oView.getModel('TimeAndActionNoListModel');
        data = oModel.getData();

        var renewArr = new Array();
        for (let index = 0; index < data['value'].length; index++) {
          const element = data['value'][index];
          var dict = {
            CODE: element['tah_no']
            // NAME: element['ProjectDescription'],
            // FIELD1: element['YY1_Category1_PPH'],
            // FIELD2: element['YY1_NoofDays_PPH'],
            // FIELD3: ''
          };
          renewArr.push(dict);
        }
        var dict = {
          title1: 'T&A No'
          // title2: 'PROJECT TEMPLATE DESCRIPTION',
          // title3: 'CATEGORY',
          // title4: 'NO OF DAYS',
          // title5: '',
          // list: renewArr
        };
        var oDataModel = new sap.ui.model.json.JSONModel(dict);
        oView.setModel(oDataModel, 'DataModel');
        var oModel = this.getView().getModel('DataModel');
        var odata = oModel.getData();

        var obji18n = oView.getModel('i18n').getResourceBundle();
        var dialog = new CFLDialog(oView, obji18n.getText('TANO'), 'search', odata); //PROJECTTEMPLATE
        dialog.open();
      },
      handlePROJECT_TEMPLATE: async function (oEvent) {
        // original
        // var oView = this.getView();
        // var obji18n = oView.getModel("i18n").getResourceBundle();
        // var dialog = new CFLDialog(oView, obji18n.getText("PROJECTTEMPLATE"), 'search');//PROJECTTEMPLATE
        // await dialog.open();

        var data;
        var oView = this.getView();
        //   if (this._From == 'addedit') {
        //     var oModel = oView.getModel('templateModel');
        //     data = oModel.getData();
        //   } else {//search
        //     var oModel = oView.getModel('projectTemplateListModel');
        //     data = oModel.getData();
        //   }
        var oModel = oView.getModel('projectTemplateListModel');
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
        var dialog = new CFLDialog(oView, obji18n.getText('PROJECTTEMPLATE'), 'search', odata); //PROJECTTEMPLATE
        dialog.open();
      },
      handleSO_NO: async function (oEvent) {
        var data;
        var oView = this.getView();
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
        var dialog = new CFLDialog(oView, obji18n.getText('SALESORDER'), 'search', data); //SALESORDER

        dialog.open();
      },
      handleStartDateChange: function (oEvent) {
        var oText = this.byId('sapUiSTART_DATE_Search'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        fltStartDate = formatter.getDateFromatIn_yyyyMMdd(sValue);
      },
      handleEndDateChange: function (oEvent) {
        var oText = this.byId('sapUiSTART_DATE_Search'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');
      },
      handleSO_LINE_ITEM_NO: async function (oEvent) {
        var oView = this.getView();
        var obji18n = oView.getModel('i18n').getResourceBundle();
        var dialog = new CFLDialog(oView, obji18n.getText('SALESORDERITEM'), 'search'); //SALESORDERITEM
        dialog.open();
      },
      handlePROJECTSTATUSComboBox: function (oEvent) {
        var selText = oEvent.getParameter('selectedItem').getText();
        var selKey = oEvent.getParameter('selectedItem').getKey();
        fltProjectStatus = selKey;
      },
      onDialogCloseSearch: async function (_sChannelId, _sEventId, _sData) {
        debugger;
        if (_sChannelId === 'ProjectTempDialogSearch') {
          fltProjectTemplate = _sData['ProjectUUID'];
          objGlobalThis.getView().byId('sapUiPROJECT_TEMPLATE_Search').setValue(_sData['ProjectDescription']);
        } else if (_sChannelId === 'SalesOrderDialogSearch') {
          fltSONo = _sData['SalesOrder'];
          objGlobalThis.getView().byId('sapUiSO_NO_Search').setValue(_sData['SalesOrder']);
        }
      },

      //Table ****************************************
      onRowTableClick: function () {
        //Table Item/Row Clicked
      },
      onEditRowClicked: function (oEvent) {
        //Edit Button
        var data = oEvent.getSource().getBindingContext('HeaderListModel').getObject();
        this.getRouter().navTo('RouteNameAddEditTimeAndAction', { data: data.tah_id });
      },

      //Data Bind *************************************
      bindDataToModel: function (data) {
        var filteredArr = [];
        data['value'].forEach((element) => {
          element.tah_startdate = formatter.getDateFromatIn_ddMMyyyy(element.tah_startdate);
          element.tah_sodeldate = formatter.getDateFromatIn_ddMMyyyy(element.tah_sodeldate);
          if (roleInfo['RoleCode'] != 'TAAdmin') {
            let filteredData = element.tactiondetail.filter((ele) => {
              return ele.emp_id_UserID != null;
            });
            if (filteredData.length > 0) {
              filteredArr.push(element);
            }
          }
        });
        var oModel = objGlobalThis.getView().getModel('HeaderListModel');
        if (roleInfo['RoleCode'] != 'TAAdmin') {
          oModel.setData({ value: filteredArr });
        } else {
          oModel.setData(data);
        }
        objGlobalThis.getView().setModel(oModel, 'HeaderListModel');
        //oModel.refresh(true);
      },
      //Logout *************************************
      onPressLogout: function () {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.put(null);

        sap.ui.getCore().getEventBus().publish('Logout', 'rowSelectEvent', '');
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo('RouteNameLogin', {}, true);

        objGlobalThis.onClearSearchButtonAction();
      },

      onExportToExcel: function () {
        WebService.getTandASearchListAllDataToExport(loginInfo['UserID']).then(function (response) {
          var aCols, oRowBinding, oSettings, oSheet, oTable;
          oTable = objGlobalThis.byId('TASearchTable');
          oRowBinding = oTable.getBinding('items');
          //var aData = oRowBinding.getModel().getProperty(oRowBinding.getPath());

          response.data.value.forEach((element) => {
            element.tah_sodeldate = formatter.getDateFromatIn_ddMMyyyy(element.tah_sodeldate);
          });
          response.data.value.sort(function (a, b) {
            return b.tah_no - a.tah_no; // For descending order
          });
          var aData = response.data['value'];

          aCols = objGlobalThis.createColumnConfig();

          oSettings = {
            workbook: {
              columns: aCols,
              hierarchyLevel: 'Level'
            },
            dataSource: aData,
            fileName: 'Time And Action List Sheet.xlsx',
            worker: false // We need to disable worker because we are using a MockServer as OData Service
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        });
      },
      createColumnConfig: function () {
        var aCols = [];

        aCols.push({
          label: 'T&A No.',
          property: 'tah_no',
          type: EdmType.String
        });

        aCols.push({
          label: 'SO No',
          property: 'tah_sono',
          type: EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Item Code',
          property: 'tah_itemcode',
          type: EdmType.String
        });

        aCols.push({
          label: 'Item Description',
          property: 'tah_itemdesc',
          type: EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Project Template Name',
          property: 'tah_prjtemplnme',
          type: EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Customer Code',
          property: '',
          type: EdmType.String
        });

        aCols.push({
          label: 'Delivery Date',
          property: 'tah_sodeldate',
          type: EdmType.String,
          width: 15
        });

        return aCols;
      }
    });
  }
);
