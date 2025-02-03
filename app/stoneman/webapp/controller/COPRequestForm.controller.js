

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "./ValueHelpDialog.controller",
  "sap/m/MessageToast",
  "./SeekAdviceCommentDialog.controller",
  "./PDAssigneeDialog.controller",
  "./PDDRRAMeetingDialog.controller",
  "sap/ui/core/format/DateFormat",
  "../service/WebService",
  "../formating/formatter",
  "sap/ui/model/json/JSONModel",
  "../model/Constants",
  "sap/ui/core/Fragment",
  "./ValueHelpFragment.controller",
  "sap/ui/core/BusyIndicator",
  "sap/m/Dialog",
  "sap/m/Image",
  "sap/m/PDFViewer",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
],
  function (Controller, UIComponent, ValueHelpDialog, MessageToast, SeekAdviceCommentDialog,
    PDAssigneeDialog, PDDRRAMeetingDialog, DateFormat, WebService, formatter, JSONModel, Constants, Fragment, ValueHelpFragment, BusyIndicator, Dialog, Image, PDFViewer, Filter, FilterOperator) {
    "use strict";
    var that;
    var getGUID;
    var absID = [];
    var oSelectDiamension;
    var oSelectDiameter;
    var inputId = "";
    var oDatePicker;
    var oCurrentDate = new Date();
    var oCrfDate = new Date();
    var costcenter;
    var absIDPDDRAMeeting = '';
    var absIDSeekAdvice = [];
    var _aBase64Files = [];
    var _aBase64FilesPDDRAMeeting = {};
    var _aBase64FilesSeekAdvice = [];
    var _fileData = [];
    var _fileDataAttachment = [];
    var screenType = '';
    var isShowView = true;
    var fileName = '';
    var imgSrcUrl;
    var Value;
    var _oSelectedRowContext;
    var _iRowIndex;
    var _oInputField;
    var bData;
    var oBusyIndicator;
    var dialogApproveorReject;
    var AttachmentData = [];
    var PDDRAMetting = {};
    var SeekAdvice = [];
    return Controller.extend("stoneman.controller.COPRequestForm", {
      //add method for routing
      onRouteMatched: function (oEvent) {
        var sData = decodeURIComponent(oEvent.getParameter("arguments").data);
        screenType = decodeURIComponent(oEvent.getParameter("arguments").type);
        getGUID = sData;
        var pddrraTab = this.getView().byId("fileUploader1");
        var pddrraBtn = this.getView().byId("uploadBtn1");
        if (screenType == 'edit') {
          this.getViewData();
          pddrraTab.setEnabled(false);
          pddrraBtn.setEnabled(false);
          //this.onToggleColumn1();
        }
        else {
          pddrraTab.setEnabled(true);
          pddrraBtn.setEnabled(true);
          this.refreshScreen();
        }

        loginInfo = lstorage.get('login_info');
        role = loginInfo['role'];
        this.myName = loginInfo['Username'];
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, "view");
        this.getData();



      

      },
      onToggleColumn1: function () {
        this._toggleColumn(5);
      },


      _toggleColumn: function (iColumnIndex) {
        var flex = this.getView().byId("AttachFlex");
        var oTable = flex.byId("cadTable");
        var aItems = oTable.getItems();

        aItems.forEach(function (oItem) {
          var aCells = oItem.getCells();
          var oCell = aCells[iColumnIndex];
          if (oCell instanceof sap.m.Input) {
            oCell.setEnabled(false);
          }
        });

        var sMessage = "Toggled enabled state of column " + (iColumnIndex + 1);
        MessageToast.show(sMessage);
      },

      refreshScreen: function () {
        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/COPRequestAddView.json",
        );
        var oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, "copRequestModel_New");
      },

      onInit: function () {
        that = this;
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouterNameCOPSearchForm").attachMatched(this.onRouteMatched, this)


        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/COPRequestAddView.json",
        );
        var oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, "copRequestModel_New");
        var oPath2 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/DropDownModel.json",
        );
        var oModel2 = new sap.ui.model.json.JSONModel(oPath2);
        this.getView().setModel(oModel2, "dropDownModel");

        var oPath6 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/MDepartment.json"
        );
        var oModel6 = new sap.ui.model.json.JSONModel(oPath6);
        this.getView().setModel(oModel6, "cadDepartment");
        var oPath1 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/buyer.json"
        );
        var oPath1 = new sap.ui.model.json.JSONModel(oPath1);
        this.getView().setModel(oPath1, "cadBuyer");

       
        oModel.setDefaultBindingMode("TwoWay"); // Enable two-way binding
        //this.setModel(oModel);
        var obji18n = this.getOwnerComponent().getModel('i18n').getResourceBundle();
        var value = obji18n.getText('pageTitle');
        this.getView().byId('page').setTitle(value);


        var aPercentages = [];
        for (var i = 1; i < 100; i++) {
          aPercentages.push({ id: i.toString(), name: i + "%" });
        }

        var oModel10 = new sap.ui.model.json.JSONModel({
          percentages: aPercentages
        });

        this.getView().setModel(oModel10, "numericalModel");

        



        this.getCurrentDate();
        this.loadHeaderFragment();
        this.loadCADCostFragment();
        this.loadAccessoryMDFGlassOtherFragment();
        this.loadPackingFragment();
        this.loadExtraChargesFragment();
        this.loadSeekAdviceFragment();
        this.loadProcessHistoryFragment();
        this.loadAttachmentFragment();
        this.loadApprovalFragment();


        

      },
      loadHeaderFragment: function () {
        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.HeaderFragment",
          controller: this
        }).then(function (oFragmentHeader) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oCADHeaderTab = oIconTabBar.getItems().find(item => item.getId().endsWith("Header"));
          oCADHeaderTab.addContent(oFragmentHeader);

         
          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });

      },
      loadCADCostFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        this._pFragment= Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.CADCostFragment",
          controller: this
        }).then(function (oFragmentCADCost) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oCADCostTab = oIconTabBar.getItems().find(item => item.getId().endsWith("CADCost"));
          oCADCostTab.addContent(oFragmentCADCost);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });
        return this._pFragment;


      },
      loadAccessoryMDFGlassOtherFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.AccessoryMDFGlassOtherFragment",
          controller: this
        }).then(function (oFragmentAccessoryMDFGlassOther) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentAccessoryMDFGlassOtherTab = oIconTabBar.getItems().find(item => item.getId().endsWith("Accessory"));
          oFragmentAccessoryMDFGlassOtherTab.addContent(oFragmentAccessoryMDFGlassOther);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });

      },
      loadPackingFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.PackingFragment",
          controller: this
        }).then(function (oFragmentPacking) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentPackingTab = oIconTabBar.getItems().find(item => item.getId().endsWith("Packing"));
          oFragmentPackingTab.addContent(oFragmentPacking);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });

      },
      
      loadExtraChargesFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.ExtraChargesFragment",
          controller: this
        }).then(function (oFragmentExtraCharges) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentExtraChargesTab = oIconTabBar.getItems().find(item => item.getId().endsWith("ExtraCharges"));
          oFragmentExtraChargesTab.addContent(oFragmentExtraCharges);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });

      },

      loadSeekAdviceFragment: function () {
        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.SeekAdviceFragment",
          controller: this
        }).then(function (oFragmentSeekAdvice) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentSeekAdviceTab = oIconTabBar.getItems().find(item => item.getId().endsWith("SeekAdvice"));
          oFragmentSeekAdviceTab.addContent(oFragmentSeekAdvice);


        });
      },


      loadAttachmentFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.AttachmentFragment",
          controller: this
        }).then(function (oFragmentAttachment) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentAttachmentTab = oIconTabBar.getItems().find(item => item.getId().endsWith("Attachment"));
          oFragmentAttachmentTab.addContent(oFragmentAttachment);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });
      },

      loadApprovalFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.ApprovalHistoryCopFragment",
          controller: this
        }).then(function (oFragmentApprovalHistoryCop) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentApprovalHistoryCopTab = oIconTabBar.getItems().find(item => item.getId().endsWith("ApprovalHistory"));
          oFragmentApprovalHistoryCopTab.addContent(oFragmentApprovalHistoryCop);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });
      },

      loadProcessHistoryFragment: function () {

        var oView = this.getView();

        // Load Fragment Header
        Fragment.load({
          id: oView.getId(),
          name: "stoneman.view.ProcessHistoryFragment",
          controller: this
        }).then(function (oFragmentProcessHistory) {

          var oIconTabBar = oView.byId("cop_idIconTabBarNoIcons");
          var oFragmentProcessHistoryTab = oIconTabBar.getItems().find(item => item.getId().endsWith("ProcessHistory"));
          oFragmentProcessHistoryTab.addContent(oFragmentProcessHistory);


          // oView.byId("fragmentContainer").byId("idIconTabBarNoIcons").byId("Header").addItem(oFragment1);
        });
      },
      addActualCostingRow: function () {

        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.ActualCosting.length;
        if (rowLen == 0) {
          data.ActualCosting[rowLen] = { 'name': "BOM" , "isDelete":false };
        }

        var bomItem = data.ActualCosting.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.ActualCosting = data.ActualCosting.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.ActualCosting.length;
        // Add the new "Stone" item
        data.ActualCosting.push({ 'name': "Stone " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.ActualCosting.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");



      },
      addBaseStoneCostRow: function () {

        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.BaseStoneCost.length;

        if (rowLen == 0) {
          data.BaseStoneCost[rowLen] = { 'name': "BOM" , "isDelete":false };
        }

        var bomItem = data.BaseStoneCost.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.BaseStoneCost = data.BaseStoneCost.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.BaseStoneCost.length;
        // Add the new "Stone" item
        data.BaseStoneCost.push({ 'name': "Stone " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.BaseStoneCost.push(bomItem);
        }
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addStoneProcessRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.StoneProcess.length;
        if (rowLen == 0) {
          data.StoneProcess[rowLen] = { 'name': "Sum Of Total Process Stone Cost","isDelete":false };
        }

        var bomItem = data.StoneProcess.find(item => item.name.startsWith("Sum Of Total Process Stone Cost"));
        if (bomItem) {
          data.StoneProcess = data.StoneProcess.filter(item => !item.name.startsWith("Sum Of Total Process Stone Cost"));
        }
        rowLen = data.StoneProcess.length;
        // Add the new "Stone" item
        data.StoneProcess.push({ 'name': "Process " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.StoneProcess.push(bomItem);
        }
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addMetalRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.MetalActualCosting.length;
        if (rowLen == 0) {
          data.MetalActualCosting[rowLen] = { 'name': "BOM" , "isDelete":false };
        }

        var bomItem = data.MetalActualCosting.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.MetalActualCosting = data.MetalActualCosting.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.MetalActualCosting.length;
        // Add the new "Stone" item
        data.MetalActualCosting.push({ 'name': "Metal " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.MetalActualCosting.push(bomItem);
        }


        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addBaseMetalCostRow: function () {

        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.BaseMetalCost.length;

        if (rowLen == 0) {
          data.BaseMetalCost[rowLen] = { 'name': "BOM","isDelete":false };
        }

        var bomItem = data.BaseMetalCost.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.BaseMetalCost = data.BaseMetalCost.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.BaseMetalCost.length;
        // Add the new "Stone" item
        data.BaseMetalCost.push({ 'name': "Metal " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.BaseMetalCost.push(bomItem);
        }
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");



      },
      addMetalProcessRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.MetalProcess.length;

        if (rowLen == 0) {
          data.MetalProcess[rowLen] = { 'name': "Sum Of Total Process Metal Cost", "isDelete":false };
        }

        var bomItem = data.MetalProcess.find(item => item.name.startsWith("Sum Of Total Process Metal Cost"));
        if (bomItem) {
          data.MetalProcess = data.MetalProcess.filter(item => !item.name.startsWith("Sum Of Total Process Metal Cost"));
        }
        rowLen = data.MetalProcess.length;
        // Add the new "Stone" item
        data.MetalProcess.push({ 'name': "Process " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.MetalProcess.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addWoodRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.wood.length;

        if (rowLen == 0) {
          data.wood[rowLen] = { 'name': "BOM" , "isDelete":false };
        }

        var bomItem = data.wood.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.wood = data.wood.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.wood.length;
        // Add the new "Stone" item
        data.wood.push({ 'name': "Wood " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.wood.push(bomItem);
        }


       
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addWoodCostRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.basewoodcost.length;
        if (rowLen == 0) {
          data.basewoodcost[rowLen] = { 'name': "BOM", "isDelete":false };
        }

        var bomItem = data.basewoodcost.find(item => item.name.startsWith("BOM"));
        if (bomItem) {
          data.basewoodcost = data.basewoodcost.filter(item => !item.name.startsWith("BOM"));
        }
        rowLen = data.basewoodcost.length;
        // Add the new "Stone" item
        data.basewoodcost.push({ 'name': "Wood " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.basewoodcost.push(bomItem);
        }


       
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addWoodProcessRow: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.woodprocess.length;

        if (rowLen == 0) {
          data.woodprocess[rowLen] = { 'name': "Sum Of Total Wood Process Cost" , "isDelete":false };
        }

        var bomItem = data.woodprocess.find(item => item.name.startsWith("Sum Of Total Wood Process Cost"));
        if (bomItem) {
          data.woodprocess = data.woodprocess.filter(item => !item.name.startsWith("Sum Of Total Wood Process Cost"));
        }
        rowLen = data.woodprocess.length;
        // Add the new "Stone" item
        data.woodprocess.push({ 'name': "Process " + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.woodprocess.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
      },
      addRow: function() {
        // Get the model bound to the table
        var oModel = this.getView().getModel("copRequestModel_New");
    
        // Get the current data
        var aData = oModel.getProperty("/Accessory");
    
        // Create a new row object with default values
        var oNewRow = {
            name: "",
            dimension: "",
            qty: 0,
            uom: "",
            unitPrice: 0,
            unitCost: 0,
            productPercent: 0,
            jobWorkCharge1: 0,
            jobWorkCharge2: 0,
            jobWorkCharge3: 0,
            assemblyFittingCharges: 0,
            totalJobWork: 0,
            overheadPercentage: 0,
            ohAmount: 0,
            wastagePercentage: 0,
            wastageCost: 0,
            totalCostOfItemIncludeAllProcess: 0,
            MDFBackPhotoFrame: ""
        };
    
        // Add the new row to the existing data
        aData.push(oNewRow);
    
        // Update the model with the new data
        oModel.setProperty("/Accessory", aData);
    },
    



      // addAccessoryGlassRow: function () {
      //   var oModel = this.getView().getModel("copRequestModel_New");
      //   var data = oModel.getData();
      //   var rowLen = data.Accessory.length;
      //   if (rowLen == 0) {
      //     data.Accessory[rowLen] = { 'name': "Sum Of Total Field" };
      //   }

      //   var bomItem = data.Accessory.find(item => item.name.startsWith("Sum Of Total Field "));
      //   if (bomItem) {
      //     data.Accessory = data.Accessory.filter(item => !item.name.startsWith("Sum Of Total Field"));
      //   }
      //   rowLen = data.Accessory.length;
      //   // Add the new "Stone" item
      //   data.Accessory.push({ 'name': "Field " + (rowLen + 1) });

      //   // Add the "BOM" item back at the end of the array, preserving its original data
      //   if (bomItem) {
      //     data.Accessory.push(bomItem);
      //   }
      //   oModel.setData(data);
      //   this.getView().setModel(oModel, "copRequestModel_New");
      // },

      

      onRaiseQueryPress: function () {
        var oModel = this.getView().getModel("copRequestModel_New");
        var data = oModel.getData();
        var rowLen = data.SeekAdvice.length;

        // if (rowLen >= 5) {
        //     // Show a message if the maximum number of rows is reached
        //     sap.m.MessageToast.show("Maximum of 5 rows can be added.");
        //     return;
        // }

        var newRow = {
          DepartmentID_DepartmentID: null,
          UserID_UserID: null,
          RoleID_RoleID: null,
          Question: null,
          Answer: null,
          SeekAdviceDocAbsId_AbsId: null,
          CrfReqID_CrfReqUUID: null
        };

        // Add the new row to the table data
        data.SeekAdvice.push(newRow);

        // Update the model with the new data
        oModel.setData(data);
        this.getView().setModel(oModel, "copRequestModel_New");
        this._fileData.push(null);
        // Optional: Refresh the binding to ensure the UI is updated
        //this.getView().byId("seekAdviceTable").getBinding("copRequestModel_New").refresh();
      },
      onDeleteStone: function (oEvent) {
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.ActualCosting.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.ActualCosting.length - 1; j++) {
                aData.ActualCosting[j].name = "Stone " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteStoneCost: function (oEvent) {
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.BaseStoneCost.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.BaseStoneCost.length - 1; j++) {
                aData.BaseStoneCost[j].name = "Stone " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteStoneProcess: function (oEvent) {
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.StoneProcess.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);

              for (var j = iIndex; j < aData.StoneProcess.length - 1; j++) {
                aData.StoneProcess[j].name = "Process " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteMetal:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.MetalActualCosting.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.MetalActualCosting.length - 1; j++) {
                aData.MetalActualCosting[j].name = "Metal " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteMetalCost:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.BaseMetalCost.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.BaseMetalCost.length - 1; j++) {
                aData.BaseMetalCost[j].name = "Metal " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteMetalProcess:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.MetalProcess.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.MetalProcess.length - 1; j++) {
                aData.MetalProcess[j].name = "Process " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },
      onDeleteWood:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.wood.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.wood.length - 1; j++) {
                aData.wood[j].name = "Wood " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })
      },onDeleteWoodCost:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.basewoodcost.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.basewoodcost.length - 1; j++) {
                aData.basewoodcost[j].name = "Wood " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })


      },onDeleteWoodProcess:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.woodprocess.splice(iIndex, 1);
              // that._fileData.splice(iIndex, 1);
              // that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              for (var j = iIndex; j < aData.woodprocess.length - 1; j++) {
                aData.woodprocess[j].name = "Process " + (j + 1); // Update the index property
              }

              oModel.setData(aData);
              this.getView().setModel(oModel, "copRequestModel_New");
            }
          }
        })

      },
      onUploadPress() {
        // if (!this._aBase64Files || !this._aBase64Files.length) {
        //   MessageToast.show("Please select at least one file first");
        //   return;
        // }
        var oPayload = [];

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
          SeekAdvice[index] =
          {
            ActualFileName: oFile.fileName,
            DisplayName: oFile.displayName,
            FileExtension: "." + oFile.extension,
            Base64File: oFile.base64String
          }
        });
        if (Object.entries(this._aBase64FilesPDDRAMeeting).length != 0) {
          PDDRAMetting = {
            ActualFileName: this._aBase64FilesPDDRAMeeting.fileName,
            DisplayName: this._aBase64FilesPDDRAMeeting.displayName,
            FileExtension: "." + this._aBase64FilesPDDRAMeeting.extension,
            Base64File: this._aBase64FilesPDDRAMeeting.base64String
          }
        } else {
          PDDRAMetting = null;
        }

        oPayload = { AttachmentData, SeekAdvice, PDDRAMetting };
        console.log(oPayload);
        WebService.postAttachmentAPI(oPayload).then(function (response) {
          if (response.code == 200) {
            response.data.value.forEach(function (item) {
              if ('AttachmentData' in item) {
                item.AttachmentData.forEach(function (ele) {
                  absID.push(ele.AbsId);
                });
              }
              if ('SeekAdvice' in item) {
                item.SeekAdvice.forEach(function (el) {
                  absIDSeekAdvice.push(el.AbsId);
                })
              }

              if ('PDDRAMetting' in item) {
                absIDPDDRAMeeting = item.PDDRAMetting.AbsId
              }

            })
            that.onSave(absID, absIDSeekAdvice, absIDPDDRAMeeting);
            //MessageToast.show("File uploaded successfully!");
          } else {
            MessageToast.show("Something went wrong");
          }

        })
      },
      onDeleteSeekAdvice:function(oEvent){
        var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        // Get the model
        var oModel = this.getView().getModel("copRequestModel_New");
        var aData = oModel.getData();
        // Update the data for the clicked row
        sap.m.MessageBox.show("Are you sure you want to delete record?", {
          title: "Confirm",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction == "YES") {
              aData.SeekAdvice.splice(iIndex, 1);
             that._fileData.splice(iIndex, 1);
             that._aBase64FilesSeekAdvice.splice(iIndex, 1);
              oModel.setData(aData);
              
            }
          }
        })

      },
      onFileChangeSeekAdvice: function (oEvent) {
        var oFileUploader = oEvent.getSource();
        var aFiles = oEvent.getParameter("files"); // Get all selected files

        var oTable = this.byId("seekadvice");
        var iRowIndex = oTable.indexOfItem(oFileUploader.getParent().getParent());

        // Store the file data for the specific row
        this._fileData[iRowIndex] = aFiles[0];
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

        if (this._fileData.length) {
          for (var i = 0; i < this._fileData.length; i++) {

            this._readFileAsBase64SeekAdvice(this._fileData[i], i);

          }


        }
        else {
          MessageToast.show("No file selected");
        }
      },
      _readFileAsBase64SeekAdvice: function (oFile, iIndex) {

        if (!oFile) {
          that._aBase64FilesSeekAdvice[iIndex] = {
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

          that._aBase64FilesSeekAdvice[iIndex] = fileData;

          // MessageToast.show("File read successfully: " + oFile.name);
        }.bind(this);
        reader.onerror = function (error) {
          MessageToast.show("Error reading file: " + error);
        };
        reader.readAsDataURL(oFile);
      },
      onDownloadFile: function (oEvent) {
        var iIndex = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
        var oView = this.getView();
        var oModel = oView.getModel("copRequestModel_New");
        var oDataAttachment = oModel.getProperty("/InspDraw/" + iIndex); // Adjust path based on your model structure
        var oDataSeekAdvice = oModel.getProperty("/SeekAdvice/" + iIndex); // Adjust path based on your model structure
        var oButton = oEvent.getSource();
        var sButtonId = oButton.getId();
        if (sButtonId.includes('downloadBtn')) {
          var payload = {
            ID: oDataAttachment.InspRefDocAbsId_AbsId
          };
        }
        if (sButtonId.includes('pddrDownlod')) {
          var payload = {
            ID: oModel.oData.PDCAttachmentAbsId_AbsId
          };
        }
        if (sButtonId.includes('seekDownloadBtn')) {
          var payload = {
            ID: oDataSeekAdvice.SeekAdviceDocAbsId_AbsId
          };
        }

        WebService.downloadAttachmentAPI(payload).then(function (response) {
          if (response.code == 200) {
            var sBase64 = response.data.value.Base64File;
            var sFileType = response.data.value.ActualFileName;
            var actualFileName = response.data.value.ActualFileName;

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
            aLink.download = actualFileName; // Assuming file extension is part of sFileType
            aLink.click();
            MessageToast.show("File downloaded successfully.");
          }

        })
      },

      onViewFile: function (oEvent) {
        var iIndex = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
        var oView = this.getView();
        var oModel = oView.getModel("copRequestModel_New");
        var oDataAttachment = oModel.getProperty("/InspDraw/" + iIndex); // Adjust path based on your model structure
        var oDataSeekAdvice = oModel.getProperty("/SeekAdvice/" + iIndex); // Adjust path based on your model structure
        var oButton = oEvent.getSource();
        var sButtonId = oButton.getId();
        if (sButtonId.includes('viewBtn')) {
          var payload = {
            ID: oDataAttachment.InspRefDocAbsId_AbsId
          };
        }
        if (sButtonId.includes('pddrrView')) {
          var payload = {
            ID: oModel.oData.PDCAttachmentAbsId_AbsId
          };
        }
        if (sButtonId.includes('seekAttachBtn')) {
          var payload = {
            ID: oDataSeekAdvice.SeekAdviceDocAbsId_AbsId
          };
        }


        BusyIndicator.show(0);
        // Make AJAX call to get the file
        WebService.viewAttachmentAPI(payload).then(function (response) {
          if (response.code == 200) {
            BusyIndicator.hide();
            var sBase64 = response.data.value.Base64File; // Adjust based on your API response
            var sFileType = response.data.value.FileExtension; // Adjust based on your API response

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
              that.getView().addDependent(oPDFViewer);
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
            } else {
              MessageToast.show("Unsupported file type.");
            }
          }

        })
      },
      openDialog: function (oEvent) {
        var oView = this.getView();
        var oSelectedRowContext = oEvent.getSource().getBindingContext("copRequestModel_New"); // Get the selected row context

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

        // Store the row index and selected row context
        this._iRowIndex = iRowIndex;

        // Store the reference to the input field and table row context
        this._oInputField = oEventSource;
        var oSelectedRowContext = oTableRow.getBindingContext("copRequestModel_New");
        var oSelectedRowContext = oEvent.getSource().getBindingContext("copRequestModel_New");


        this._oSelectedRowContext = oSelectedRowContext;


        dialog.open(oSelectedRowContext, oSelectedData);
      },
      handleFragmentSelection: function (sReplyValue) {
        // var sSelectedItem = oData.selectedItem;
        // Example method in main controller to handle fragment selection
        var oModel = this.getView().getModel("copRequestModel_New");
        oModel.setProperty(this._oSelectedRowContext.getPath() + "/Answer", sReplyValue);
        //oModel.setProperty("/selectedItem", sSelectedItem);
        console.log("Selected Item:", sReplyValue);
        console.log("Selected Item:", oModel);
      },
      _getDynamicFieldName: function (oData) {
        // Logic to determine the dynamic field name
        // For example, returning the first field name dynamically
        var aKeys = [];
        if (this.inputId != "user" && this.inputId != "userseek" && this.inputId != "pdCoordinator"
          && this.inputId != "oldcrf"
        ) {
          aKeys = oData.columnHeaders;

        }
        else {
          aKeys = oData.columnHeaders
            .filter(function (header) {
              return header.visible !== false;
            })
            .map(function (header) {
              return header.label;
            });
        }
        //  var aKeys = Object.keys(oData.rows[0]).slice(1,6);
        //return aKeys.length > 0 ? aKeys[0] : null; // Adjust as necessary

        return aKeys;
      },
      onValueHelpRequest: function (inputId, oEvent) {
        this.inputId = inputId;
        var oEventBus = this.getOwnerComponent().getEventBus();

        // Re-subscribe if necessary
        oEventBus.subscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);

        this.getOwnerComponent().getEventBus().publish("stoneman", "openDynamicDialog", {
          event: oEvent,
          dialogTitle: inputId,
          dynamicFields: [
            { placeholder: "Dynamic Field 1" },
            { placeholder: "Dynamic Field 2" },
            { placeholder: "Dynamic Field 3" }
          ]
          // event: oEvent
        });
      },
      onCloseDialog: function () {
        // Close the dialog when the close button is pressed
        this.byId("buyer").setValue("");
        this._pDynamicDialog.then(function (oDialog) {
          var oTable = that.byId("dynamicTable");

          oTable.removeAllColumns();
          oDialog.close();
        });
        this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);

      },
      onValueHelpItemCode: function (oEvent) {
        this.onValueHelpRequest("itemcode", oEvent);
        inputId = "itemcode";
      },

      onValueHelpDepartmentSeek: function (oEvent) {
        this.onValueHelpRequest("deptseek", oEvent);
        inputId = "deptseek";
      },
      onValueHelpUserSeek: function (oEvent) {
        this.onValueHelpRequest("userseek", oEvent);
        inputId = "userseek";
      },
      onValueHelpBuyer: function (oEvent) {
        this.onValueHelpRequest("buyer", oEvent);
        inputId = "buyer";
      },

      onValueHelpItemDesc: function (oEvent) {
        this.onValueHelpRequest("itemDescription", oEvent);
        inputId = "itemDescription";
      },
      onValueHelpPdCoordinator: function (oEvent) {
        this.onValueHelpRequest("pdCoordinator", oEvent);
        inputId = "pdCoordinator";
      },

      onValueHelpItemGroup: function (oEvent) {
        this.onValueHelpRequest("itemGroup", oEvent);
        inputId = "itemGroup";
      },
      onValueHelpDepartment: function (oEvent) {
        this.onValueHelpRequest("department", oEvent);
        inputId = "department";
      },

      onValueHelpUser: function (oEvent) {
        this.onValueHelpRequest("user", oEvent);
        inputId = "user";
      },
      onValueHelpOldcrfReq: function (oEvent) {
        this.onValueHelpRequest("oldcrf", oEvent);
        inputId = "oldcrf";
      },

      openDynamicDialog: function (sChannel, sEvent, oData) {

        var oEvent = oData.event; // Retrieve the original event object
        var inputId = oData.dialogTitle; // Retrieve the input ID
        var oView = this.getView();
        var oSelectedRowContext = oEvent.getSource().getBindingContext("cadDepartment");
        var bData;
        // this._oSelectedRowContext = oSelectedRowContext;

        // Check if the dialog is already created
        if (inputId == "department" || inputId == "user") {
          var oView = this.getView();

          var oEventSource = oEvent.getSource();
          var oTableRow = oEventSource.getParent();
          var oTable = oTableRow.getParent();
          var iRowIndex = oTable.indexOfItem(oTableRow);
          console.log("Row Index:", iRowIndex);

          // Store the row index and selected row context
          this._iRowIndex = iRowIndex;

          // Store the reference to the input field and table row context
          this._oInputField = oEventSource;
          var oSelectedRowContext = oTableRow.getBindingContext("copRequestModel_New");
          var oSelectedRowContext = oEvent.getSource().getBindingContext("copRequestModel_New");


          this._oSelectedRowContext = oSelectedRowContext;

          var oTable = this.getView().byId("pddrraTable");
          var oRow = oTable.getItems()[this._iRowIndex];
          var oInputField = oRow.getCells()[0]; // Assuming the input field is the second cell

          bData = oInputField.getValue();
        }
        else if (inputId == "userseek" || inputId == "deptseek") {


          var oView = this.getView();

          var oEventSource = oEvent.getSource();
          var oTableRow = oEventSource.getParent();
          var oTable = oTableRow.getParent();
          var iRowIndex = oTable.indexOfItem(oTableRow);
          console.log("Row Index:", iRowIndex);

          // Store the row index and selected row context
          this._iRowIndex = iRowIndex;

          // Store the reference to the input field and table row context
          this._oInputField = oEventSource;
          var oSelectedRowContext = oTableRow.getBindingContext("copRequestModel_New");
          var oSelectedRowContext = oEvent.getSource().getBindingContext("copRequestModel_New");


          this._oSelectedRowContext = oSelectedRowContext;

          var oTable = this.getView().byId("seekadvice");
          var oRow = oTable.getItems()[this._iRowIndex];
          var oInputField = oRow.getCells()[0]; // Assuming the input field is the second cell

          bData = oInputField.getValue();



        }
        else if (inputId == "itemcode") {

          var sKey = this.byId("itemGroup").getSelectedKey(); // Product key
          var oModel = this.getView().getModel("MItemGroupModel");
          var aItemGroups = oModel.getProperty("/d/results");

          var selectedItem = aItemGroups.find(function (item) {
            return item.Product === sKey;
          });

          if (selectedItem) {
            oModel.setProperty("ItemCode", selectedItem.Product);
            //  this.byId("itemCode").setValue(selectedItem.Product); // Use ProductGroup or any other property
          } else {
            oModel.setProperty("ItemCode", "");
            this.byId("itemCode").setValue(""); // Clear item code if no match
          }

          //  bData = this.byId("itemCode").getValue();
          bData = selectedItem.Product;

        }
        var inputId = oData.dialogTitle;
        var title = "";
        var inputKey = "";
        var i18nModel = this.getView().getModel("i18n");
        if (i18nModel) {


          if (inputId === "buyer") {
            inputKey = "buyerTitle";
          } else if (inputId === "pdCoordinator") {
            inputKey = "pdCoordinatorTitle";
          } else if (inputId === "itemDescription") {
            inputKey = "itemDescriptionTitle";
          } else if (inputId === "itemGroup") {
            inputKey = "itemGroupTitle";
          }
          else if (inputId === "department") {
            inputKey = "departmentTitle";
          }

          else if (inputId === "user") {
            inputKey = "userTitle";
          }
          else if (inputId === "userseek") {
            inputKey = "userseek";
          }
          else if (inputId === "deptseek") {
            inputKey = "deptseek";
          }

          title = this.getView().getModel("i18n").getResourceBundle().getText(inputKey);

        }
        if (!this._pDynamicDialog) {
          this._pDynamicDialog = Fragment.load({
            id: this.getView().getId(),
            name: "stoneman.view.ValueHelpFragment",
            controller: this
          }).then(function (oDialog) {
            this.getView().addDependent(oDialog);
            oDialog.setTitle(title);
            return oDialog;
          }.bind(this));
        }

        // Open the dialog and add dynamic fields
        this._pDynamicDialog.then(function (oDialog) {
          this.oBusyIndicator = Fragment.byId(this.getView().getId(), "busyIndicator");
          this.oBusyIndicator.setVisible(true);
          this._createTableColumnsAndRows(inputId, bData);
          oDialog.setTitle(title);
          oDialog.open();
          BusyIndicator.hide();
        }.bind(this));
      },
      camelCaseToSpaces: function (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2');
      },
      _createTableColumnsAndRows: function (inputId, bData) {
        // Sample data
        // Clear search field value on fragment initialization
        this.byId("idSearchField").setValue("");

        // this._showBusyIndicator(true);

        WebService.getAPIForFragment(inputId, bData).then(function (response) {

          if (response) {

            if (that.oBusyIndicator) {
              that.oBusyIndicator.setVisible(false); // Hide busy indicator
            }
          }
          if (response.code == 200) {

            var oTable = that.byId("dynamicTable");

            oTable.removeAllColumns();
            var oData = {
              columnHeaders: [],
              rows: []
            };
            var aData;


            if (inputId == "buyer" || inputId == "pdCoordinator" || inputId == "user" || inputId == "userseek") {
              var oModel = that.getView().getModel("cadBuyer");
              aData = oModel.getData();


              for (var i = 0; i <= aData.d.results.length; i++) { aData.d.results.pop(); }
              aData.d.results = [];
              for (var i = 0; i <= response.data.d.results.length; i++) {
                aData.d.results.push(response.data.d.results[i]

                );


              } oModel.setData(aData);
              that.getView().setModel(oModel, "cadBuyer");
              //oModel.setData(response.data.value);

              oData.rows = aData.d.results;
            }
            else if (inputId == "itemGroup") {

              var oModel = that.getView().getModel("cadItemGroup");
              aData = oModel.getData();
              aData.d.ProductGroup = response.data.d.ProductGroup;
              oModel.setData(aData);
              that.getView().setModel(oModel, "cadItemGroup");
              //oModel.setData(response.data.value);
              oData.rows[0] = aData.d;
            }
            else if (inputId == "itemcode") {
              var oModel = that.getView().getModel("cadItemGroup");
              aData = oModel.getData();
              aData.d = [];
              for (var i = 0; i < response.data.d.to_Description.results.length; i++) {
                aData.d.push(response.data.d.to_Description.results[i]);
              }
              // aData.d.ProductDescription = response.data.d.to_Description.results[0].ProductDescription;
              // aData.d.Product = response.data.d.to_Description.results[0].Product;

              oModel.setData(aData);
              that.getView().setModel(oModel, "cadItemGroup");
              //oModel.setData(response.data.value);
              var bEditable = response.data.d.to_Description.results.length > 0; // Example condition
              that.byId("itemDesc").setEditable(!bEditable);
              oData.rows = aData.d;

            }
            else if (inputId == "department" || inputId == "deptseek") {
              var oModel = that.getView().getModel("cadDepartment");
              var aData = oModel.getData();
              aData.value = [];
              for (var i = 0; i < response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              that.getView().setModel(oModel, "cadDepartment");
              oModel.setData(response.data.value);

              oModel.setData(aData);
              oData.rows = aData.value;
            }

            else if (inputId == "user") {
              var oModel = that.getView().getModel("cadBuyer");
              aData = oModel.getData();


              for (var i = 0; i <= aData.d.results.length; i++) { aData.d.results.pop(); }
              aData.d.results = [];
              for (var i = 0; i <= response.data.d.results.length; i++) {
                aData.d.results.push(response.data.d.results[i]

                );


              } oModel.setData(aData);
              that.getView().setModel(oModel, "cadBuyer");
              //oModel.setData(response.data.value);

              oData.rows = aData.d.results;
            }

            else if (inputId == "oldcrf") {
              var oModel = that.getView().getModel("cadRequestCrf");
              var aData = oModel.getData();
              aData.value = [];
              for (var i = 0; i < response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              that.getView().setModel(oModel, "cadRequestCrf");
              oModel.setData(response.data.value);

              oModel.setData(aData);
              oData.rows = aData.value;
            }

            if (inputId == 'buyer') {
              oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders.push("BusinessPartnerName");
            }
            else if (inputId == 'pdCoordinator') {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders = [{ label: "PersonFullName", template: "PersonFullName" },
              { label: "BusinessPartnerUUID", template: "BusinessPartnerUUID", visible: false }];
            }

            else if (inputId == 'itemcode') {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders = ["Product", "ProductDescription"];
            }

            else if (inputId == 'itemGroup') {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders = ["ProductGroup"];
            }
            else if (inputId == 'department' || inputId == "deptseek") {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders = ["CostCenter", "CostCenterName", "CostCenterDescription"];
            }

            else if (inputId == 'user' || inputId == "userseek") {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              //  oData.columnHeaders = ["Person","PersonFullName","BusinessPartnerUUID"];

              oData.columnHeaders = [{ label: "Person", template: "Person" },
              { label: "PersonFullName", template: "PersonFullName" },
              { label: "BusinessPartnerUUID", template: "BusinessPartnerUUID", visible: false }];
            }
            else if (inputId == "oldcrf") {
              oData.columnHeaders =
                [{ label: "OldCrfReqNo", template: "OldCrfReqNo" },
                { label: "OldCrfReqUUID", template: "OldCrfReqUUID   ", visible: false }];
            }



            var oModel = new JSONModel(oData);
            oModel.setData(oData);
            that.getView().setModel(oModel);


            if (inputId != "user" && inputId != "userseek" && inputId != "pdCoordinator" && inputId != "oldcrf") {
              oData.columnHeaders.forEach(function (headerText) {
                {
                  var headerText2 = that.camelCaseToSpaces(headerText);
                  oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({ text: headerText2 }).addStyleClass("columnHeaderStyle")
                  }));
                }
              });
            }
            if (inputId == "user" || inputId == "userseek" || inputId == "pdCoordinator" || inputId == "oldcrf") {
              oData.columnHeaders.forEach(function (column) {
                var headerText2 = that.camelCaseToSpaces(column.label);
                oTable.addColumn(new sap.m.Column({
                  header: new sap.m.Label({ text: headerText2 }),
                  template: new sap.m.Text({ text: column.template }),
                  visible: column.visible !== false
                }));
              });
              // template: new sap.m.Text({ text: "{" + column.template + "}" }),   
            }
            if (inputId != "userseek" && inputId != "user" && inputId != "pdCoordinator" && inputId != "oldcrf") {
              var aCells = oData.columnHeaders.map(function (propertyName) {
                return new sap.m.Text({ text: "{" + propertyName + "}" });
              });

            }
            if (inputId == "user" || inputId == "userseek" || inputId == "pdCoordinator" || inputId == "oldcrf") {
              var aCells = oData.columnHeaders.map(function (propertyName) {
                return new sap.m.Text({ text: "{" + propertyName.label + "}" });
              });
            }
            // Create rows
            var oTemplate = new sap.m.ColumnListItem({
              type: "Active",
              press: that.onRowPress.bind(that),
              cells: aCells
            });


            oTable.bindItems({
              path: "/rows",
              template: oTemplate
            });

          }
        });

      },
      onRowPress: function (oEvent) {
        // Get the selected row context
        var oSelectedItem = oEvent.getParameter("listItem");
        var oBindingContext = oSelectedItem.getBindingContext();

        // Get the data of the selected row
        var oSelectedRowData = oBindingContext.getObject();

        // Pass the selected row data to the main controller
        this._handleSelectedRow(oSelectedRowData);
      },

      _handleSelectedRow: function (oData) {
        var sSelectedData;
        var CadUserAssgId;
        if (inputId == "buyer") {
          sSelectedData = oData.BusinessPartnerName;
          this.byId("buyer").setValue(sSelectedData);
          var oModel = this.getView().getModel("copRequestModel_New");
          var SelectedData = oData.BusinessPartner;
          oModel.setProperty("/BuyerCode", SelectedData);
        }
        else if (inputId == "itemcode") {
          sSelectedData = oData.ProductDescription;

          this.byId("itemDesc").setValue(sSelectedData);
          var SelectedData = oData.Product;
          this.byId("itemCode").setValue(SelectedData);
          var oModel = this.getView().getModel("copRequestModel_New");

          oModel.setProperty("/ItemDesc", sSelectedData);
          oModel.setProperty("/ItemCode", SelectedData);
        }
        else if (inputId == "pdCoordinator") {
          sSelectedData = oData.PersonFullName;
          this.byId("pdCoordinator").setValue(sSelectedData);

          var oModel = this.getView().getModel("copRequestModel_New");
          var SelectedData = oData.BusinessPartner;
          oModel.setProperty("/PDCUserId_UserID", SelectedData);
        }
        else if (inputId == "oldcrf") {
          sSelectedData = oData.OldCrfReqNo;
          this.byId("oldCadReq").setValue(sSelectedData);

          var oModel = this.getView().getModel("copRequestModel_New");
          var SelectedData = oData.OldCrfReqNoUUID;
          oModel.setProperty("/OldCrfReqNoUUID", SelectedData);
          this.onChangeOldCrfReqNo();
        }
        else if (inputId == "itemGroup") {
          sSelectedData = oData.ProductGroup;
          this.byId("itemGroup").setValue(sSelectedData);
        }
        else if (this.inputId == "department") {
          // var oModel = this.getView().getModel("cadDepartment");
          // sSelectedData = oData.CostCenter;
          // oModel.setProperty(this._oSelectedRowContext.getPath() + "/departmentMeetingDialog", sSelectedData);

          // { 
          var oModel = this.getView().getModel("copRequestModel_New");
          sSelectedData = oData.CostCenter;
          oModel.setProperty(this._oSelectedRowContext.getPath() + "/departmentName", sSelectedData);

          //  var oSelectedContext = oEvent.getParameter("listItem").getBindingContext("yourFragmentModel");

          // Retrieve the value to set from the selected context
          // var sValueToSet = oSelectedContext.getProperty("yourProperty");

          // Set the value in the specific field of the table row using the stored index
          if (this._iRowIndex !== undefined && this._oSelectedRowContext) {
            var oTable = this.getView().byId("pddrraTable");
            var oRow = oTable.getItems()[this._iRowIndex];
            var oInputField = oRow.getCells()[0]; // Assuming the input field is the second cell

            oInputField.setValue(sSelectedData);
          }



        }

        else if (inputId == "user") {
          var oModel = this.getView().getModel("copRequestModel_New");
          sSelectedData = oData.PersonFullName;
          var guid = oData.BusinessPartnerUUID;
          oModel.setProperty(this._oSelectedRowContext.getPath() + "/pddrraUser", sSelectedData);
          oModel.setProperty(this._oSelectedRowContext.getPath() + "/UserID_UserID", guid);



          // Set the value in the specific field of the table row using the stored index
          if (this._iRowIndex !== undefined && this._oSelectedRowContext) {
            var oTable = this.getView().byId("pddrraTable");
            var oRow = oTable.getItems()[this._iRowIndex];
            var oInputField = oRow.getCells()[1]; // Assuming the input field is the second cell

            oInputField.setValue(sSelectedData);
          }

        }
        else if (this.inputId == "deptseek") {
          var oModel = this.getView().getModel("copRequestModel_New");
          sSelectedData = oData.CostCenter;

          oModel.setProperty(this._oSelectedRowContext.getPath() + "/departmentName", sSelectedData);

          //  var oSelectedContext = oEvent.getParameter("listItem").getBindingContext("yourFragmentModel");

          // Retrieve the value to set from the selected context
          // var sValueToSet = oSelectedContext.getProperty("yourProperty");

          // Set the value in the specific field of the table row using the stored index
          if (this._iRowIndex !== undefined && this._oSelectedRowContext) {
            var oTable = this.getView().byId("seekadvice");
            var oRow = oTable.getItems()[this._iRowIndex];
            var oInputField = oRow.getCells()[0]; // Assuming the input field is the second cell

            oInputField.setValue(sSelectedData);
          }



        }
        // else if (this.inputId == "userseek") {
        // var oModel = this.getView().getModel("cadDepartment");
        // sSelectedData = oData.PersonFullName;
        // oModel.setProperty(this._oSelectedRowContext.getPath() + "/user", sSelectedData);

        // //  var oSelectedContext = oEvent.getParameter("listItem").getBindingContext("yourFragmentModel");

        // // Retrieve the value to set from the selected context
        // // var sValueToSet = oSelectedContext.getProperty("yourProperty");

        // // Set the value in the specific field of the table row using the stored index
        // if (this._iRowIndex !== undefined && this._oSelectedRowContext) {
        //   var oTable = this.getView().byId("seekAdviceTable");
        //   var oRow = oTable.getItems()[this._iRowIndex];
        //   var oInputField = oRow.getCells()[2]; // Assuming the input field is the second cell

        //   oInputField.setValue(sSelectedData);
        // }
        else if (this.inputId == "userseek") {
          var oModel = this.getView().getModel("copRequestModel_New");
          sSelectedData = oData.PersonFullName;
          var guid = oData.BusinessPartnerUUID;
          oModel.setProperty(this._oSelectedRowContext.getPath() + "/userName", sSelectedData);
          oModel.setProperty(this._oSelectedRowContext.getPath() + "/UserID_UserID", guid);
          //  var oSelectedContext = oEvent.getParameter("listItem").getBindingContext("yourFragmentModel");

          // Retrieve the value to set from the selected context
          // var sValueToSet = oSelectedContext.getProperty("yourProperty");

          // Set the value in the specific field of the table row using the stored index
          if (this._iRowIndex !== undefined && this._oSelectedRowContext) {
            var oTable = this.getView().byId("seekadvice");
            var oRow = oTable.getItems()[this._iRowIndex];
            var oInputField = oRow.getCells()[1]; // Assuming the input field is the second cell

            oInputField.setValue(sSelectedData);
          }
        }
        this._pDynamicDialog.then(function (oDialog) {
          var oTable = that.byId("dynamicTable");

          oTable.removeAllColumns();
          oDialog.close();
        });
      },
      onSearchTable: function (oEvent, oData) {
        // Get the search query
        var sQuery = oEvent.getParameter("query");
        console.log("query", sQuery);
        if (sQuery == "" || sQuery == null || sQuery == undefined) {
          return;
        }
        // Create a filter array
        var aFilters = [];

        if (sQuery && sQuery.length > 0) {
          // Add filters for the fields to be searched
          var oTable = that.byId("dynamicTable");
          var oModel = that.getView().getModel();
          var oData = oModel.getData();
          var sDynamicFieldName = this._getDynamicFieldName(oData);

          sDynamicFieldName.forEach(function (fieldName) {
            var fieldType = typeof oData.rows[0][fieldName]; // Assuming first row's field type is indicative

            if (fieldType === 'string') {
              // For string fields, use FilterOperator.Contains
              aFilters.push(new Filter(fieldName, FilterOperator.Contains, sQuery));
            } else if (fieldType === 'number') {
              // For number fields, convert the query to a number and use FilterOperator.EQ
              var queryNumber = parseFloat(sQuery);
              if (!isNaN(queryNumber)) {
                aFilters.push(new Filter(fieldName, FilterOperator.EQ, queryNumber));
              }
            }
          });



          // sDynamicFieldName.forEach(function (element) {
          //   aFilters.push(new Filter(element, FilterOperator.Contains, sQuery));
          // });
          // if (this.inputId != "user" && this.inputId != "userseek" && this.inputId != "pdCoordinator" 
          //   && this.inputId != "oldcrf"
          // ) {
          //   sDynamicFieldName.forEach(function (element) {
          //     aFilters.push(new Filter(element, FilterOperator.Contains, sQuery));
          //   });
          // }
          // else {
          //   sDynamicFieldName.forEach(function (element) {
          //     aFilters.push(new Filter(element.label, FilterOperator.Contains, sQuery));
          //   });
          // }
        }
        // Get the binding of the table items
        var oTable = this.byId("dynamicTable");
        var oBinding = oTable.getBinding("items");
        // Combine filters using OR operator
        var oCombinedFilter = new Filter({
          filters: aFilters,
          and: false // Use 'and: false' for OR operator
        });
        oBinding.filter(oCombinedFilter, "Application");
      },

      onExit() {
        var oModel = this.getView().getModel("copRequestModel_New");
        oModel.setData(null);
      },
      getCurrentDate: function () {
        var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
        oDatePicker = this.byId("mercReqDate");
        //  oDatePicker.setValue(oDateFormat.format(oCurrentDate));
      },

      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      onRouterClick: function () {
        this.getRouter().navTo("TargetAddProduct");
      },

      onNavBack: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouterNameCOPSearchForm");
      },


      
      onSubmit: function () {

        var oModel = this.getView().getModel("copRequestModel_New");
        var oData = oModel.getData();
        var body = {
          itemCode: oData.itemCode,
          itemDescription: oData.itemDescription,
          sciplCode: oData.sciplCode,
          costingType: oData.costingType,
          costingVersion: oData.costingVersion,
          cadNo: oData.cadNo,
          cadName: oData.cadName,
          soNo: oData.soNo,
          diameter: oData.diameter,
          length: oData.length,
          width: oData.width,
          height: oData.height,
          unit: oData.unit,
          weight: oData.weight
        };
        if (oData.Material) {
          oData.Material.forEach(function (item) {
            let material = {
              MaterialAutoCode: null,
              MaterialCatHanaText: null,
              MaterialCatFreeText: null,
              Remarks: null,

            }
            material.MaterialAutoCode = item.MaterialAutoCode;
            material.MaterialCatHanaText = item.MaterialCatHanaText;
            material.MaterialCatFreeText = item.MaterialCatFreeText;

            material.Remarks = item.Remarks;
            body.Material.push(material);

          })
        } else {
          body.Material = null;
        }





        console.log("body", body);
      },
      onAfterRendering: function () {
        // This method is called after the view has been rendered
        var oIconTabBar = this.byId("idIconTabBarNoIconsCADCost");
        var oNestedIconTabBar = this.byId("idIconTabBarNoIconsCADCostNested");

        // Ensure the first filter is selected by default
        if (oIconTabBar && oNestedIconTabBar) {
            oIconTabBar.setSelectedKey("Stone"); // Set default key for parent tab bar
            oNestedIconTabBar.setSelectedKey("ActualCosting"); // Set default key for nested tab bar
        }

        
    },
    onIconTabBarSelectCADCostNested:function(oEvent){

    //  var oSelectedItem = oEvent.getParameter("selectedItem");
      //     // Example of handling selection, you can add your own logic
      //     console.log("Selected Tab Key:", oSelectedItem.getKey());
    
      var oNestedIconTabBar = this.byId("idIconTabBarNoIconsCADCostNested");
      if (oNestedIconTabBar) {
          oNestedIconTabBar.setSelectedKey("ActualCosting");
      }

       oNestedIconTabBar = this.byId("idIconTabBarNoIconsMetalNested");
      if (oNestedIconTabBar) {
          oNestedIconTabBar.setSelectedKey("ActualCostingMetal");
      }
      oNestedIconTabBar = this.byId("idIconTabBarNoIconsWoodNested");
      if (oNestedIconTabBar) {
          oNestedIconTabBar.setSelectedKey("ActualCostingWood");
      }

      //     // Optionally, you can force the selection of the first filter of the nested tab bar
         

    },
  //   onIconTabBarSelect: function (oEvent) {
  //     var oSelectedItem = oEvent.getParameter("selectedItem");
  //     // Example of handling selection, you can add your own logic
  //     console.log("Selected Tab Key:", oSelectedItem.getKey());

  //     var oNestedIconTabBar = this.byId("idIconTabBarNoIconsCADCost");
  //     if (oNestedIconTabBar) {
  //         oNestedIconTabBar.setSelectedKey("Stone");
  //     }
  //     // Optionally, you can force the selection of the first filter of the nested tab bar
     

  // },
  //  selectIconTabBarNoIconsHeader:function(oEvent){

  //   var oSelectedItem = oEvent.getParameter("selectedItem");
  //     // Example of handling selection, you can add your own logic
  //     console.log("Selected Tab Key:", oSelectedItem.getKey());

  //     // Optionally, you can force the selection of the first filter of the nested tab bar
  //     var oNestedIconTabBar = this.byId("idIconTabBarNoIconsHeader");
  //     if (oNestedIconTabBar) {
  //         oNestedIconTabBar.setSelectedKey("HeaderNested");
  //     }


  // },

//   onBeforeRendering: function () {

//     this.loadCADCostFragment().then(function (oFragment) {
//     var oTable = oFragment.byId("cop_stone");
//     var oItems = oTable.getItems();
//     var iLength = oItems.length;

//     oItems.forEach(function (oItem, index) {
//         var oButton = oItem.getCells()[12]; // Adjust based on your layout
//         if (index === iLength - 1) {
//             oButton.setVisible(false);
//         } else {
//             oButton.setVisible(true);
//         }
//     });

//   });
// }

    });
  });
