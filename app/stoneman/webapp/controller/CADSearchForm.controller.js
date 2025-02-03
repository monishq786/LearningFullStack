sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "../model/Constants",
  "sap/ui/model/json/JSONModel",
  "../service/WebService",
  "sap/ui/core/UIComponent",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/ui/core/Fragment",
  "./ValueHelpFragment.controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
], function (Controller, Constants, JSONModel, WebService, UIComponent, ODataModel, Fragment, ValueHelpFragment,
  Filter, FilterOperator, DateFormat, BusyIndicator, MessageToast, History) {
  var merchantVal = '';
  var that;
  var inputId = "";
  var userId;
  var oBusyIndicator;
  var buyerCode;
  'use strict';

  return Controller.extend("stoneman.controller.CADSearchForm", {
    onRouteMatched: function (oEvent) {
      var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      role_Info = lstorage.get('role_details');
      if (role_Info.RoleCode === 'MERCHANT_TL' || role_Info.RoleCode === 'MERCHANT_ATL' || role_Info.RoleCode === 'HEAD') {
        var oView = this.getView();
        var oButton = oView.byId("addMarchant");
        oButton.setVisible(true);
      } else {
        var oView = this.getView();
        var oButton = oView.byId("addMarchant");
        oButton.setVisible(false);
      }
      loginInfo = lstorage.get('login_info');
      userId = loginInfo.UserID;
      role = loginInfo['role'];
      this.myName = loginInfo['Username'];
      var oViewModel = new JSONModel({ myName: this.myName });
      this.getView().setModel(oViewModel, "view");
      this.getListData();
      this.refreshScreen();
    },
    refreshScreen: function () {
      this.byId("cadNo").setValue(null);
      this.byId("buyer").setValue(null);
      this.byId("tech").setValue(null);
      //this.byId("status").setValue(null);
      this.byId("date").setValue(null);
    },
    onInit: function () {
      that = this;
      var oRouter = UIComponent.getRouterFor(this);
      oRouter.getRoute("RouterNameCADSearchForm").attachMatched(this.onRouteMatched, this)
      var oPath = jQuery.sap.getModulePath(
        "stoneman",
        "/model/buyer.json"
      );
      var oModel1 = new sap.ui.model.json.JSONModel(oPath);
      this.getView().setModel(oModel1, "cadBuyer");


      var oPath3 = jQuery.sap.getModulePath(
        "stoneman",
        "/model/CADSearchModel.json"
      );
      var oModel3 = new sap.ui.model.json.JSONModel(oPath3);
      this.getView().setModel(oModel3, "cadSearchModel");

      var oPath4 = jQuery.sap.getModulePath(
        "stoneman",
        "/model/CADRequestForm.json"
      );
      var oModel4 = new sap.ui.model.json.JSONModel(oPath4);
      this.getView().setModel(oModel4, "cadRequestModel");

      var oPathMUser = jQuery.sap.getModulePath(
        "stoneman",
        "/model/MUser.json"
      );
      var oPathMUser = new sap.ui.model.json.JSONModel(oPathMUser);
      this.getView().setModel(oPathMUser, "MUserModel");
      that.readOnlyInputFun();
    },
    readOnlyInputFun: function () {
      this.getView().byId('buyer').setValueHelpOnly(true);
      this.getView().byId('cadNo').setValueHelpOnly(true);
      this.getView().byId('tech').setValueHelpOnly(true);
    },
    setButtonVisibility: function () {
      var oView = this.getView();
      var oButton = oView.byId("addMarchant");
      oButton.setVisible(true);
    },
    navBack: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteLanding", {}, true);
    },

    onPressLogout: function () {
      var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      oStorage.put(null);
      sap.ui.getCore().getEventBus().publish("Logout", "rowSelectEvent", '');
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteNameLogin", {}, true);
    },
    getListData: function () {
      var body = {
        guid: userId
      }
      WebService.getTCRFHeaderSearch(body).then(function (response) {
        if (response.code == 200) {
          var oModel = that.getView().getModel("cadRequestModel");
          if (response.data.value.length > 0) {
            var returnData = response.data.value;
            returnData.forEach(function (item) {
              item.CRFSTATUS =
                  item.CRFSTATUS == "WIP" ? "In Progress" :
                  item.CRFSTATUS == "C" ? "Cancel" :
                  item.CRFSTATUS == "CLS" ? "Close" : "New";
            })
            var oModel = that.getView().getModel("cadRequestModel");

            oModel.setData({ RETURNDATA: returnData });
            that.getView().setModel(oModel, "cadRequestModel");
            console.log(oModel);
          }

        }

      });
    },
    updatePagedItems: function () {
      var oModel = this.getView().getModel("cadRequestModel");
      var data = oModel.getData();
      var startIndex = (data.currentPage - 1) * data.pageSize;
      var endIndex = startIndex + data.pageSize;
      data.pagedItems = data.items.slice(startIndex, endIndex);
      oModel.setData(data);
      oModel.refresh();
    },

    onAction: function (oEvent) {
      var sPath = oEvent.getSource().getBindingContext("cadRequestModel").getPath();
      var iIndex = parseInt(sPath.split("/")[2]);
      var oModel = that.getView().getModel("cadRequestModel");
      var aData = oModel.getData();
      var oRouter = UIComponent.getRouterFor(this);
      var sData = aData.RETURNDATA[iIndex].CRFREQUUID;
      oRouter.navTo("RouterNameCADRequestForm", {
        data: encodeURIComponent(sData),
        type: 'edit'
      });
    },

    getRouter: function () {
      return sap.ui.core.UIComponent.getRouterFor(this);
    },

    onRouterClick: function () {
      this.getRouter().navTo("RouterNameCADRequestForm", {
        data: encodeURIComponent(0),
        type: 'add'
      });
    },

    onDemoClick: function () {
      this.getRouter().navTo("NameCADReqDemo");
    },
    onUpload: function () {
      this.getRouter().navTo("NametryOut");
    },
    getUserValue: function () {
      var oText = this.byId('userType').getValue()
      console.log(oText)
    },

    onChange: function () {
      var oModel = this.getView().getModel("cadRequestModel");
      var oData = oModel.getData();
      oModel.setData(oData);
      merchantVal = oData.MerchantType;
      console.log(merchantVal);
    },
    formatReqTyp: function (sReqTyp) {
      return sReqTyp == "N" ? "New" : sReqTyp == "R" ? "Repeat" : null
    },
    onValueHelpRequest: function (inputId) {
      // Publish an event to open the dialog and add dynamic fields
      var oEventBus = this.getOwnerComponent().getEventBus();

      // Re-subscribe if necessary
      oEventBus.subscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);

      this.getOwnerComponent().getEventBus().publish("stoneman", "openDynamicDialog", {
        dialogTitle: inputId
      });



    }, onCloseDialog: function () {
      BusyIndicator.hide();
      // Close the dialog when the close button is pressed
      this._pDynamicDialog.then(function (oDialog) {
        var oTable = that.byId("dynamicTable");
        oTable.removeAllColumns();
        oDialog.close();
      });
      this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);
    },

    openDynamicDialog: function (sChannel, sEvent, oData) {

      // Check if the dialog is already created
      var inputId = oData.dialogTitle;
      var title = "";
      var i18nModel = this.getView().getModel("i18n");
      if (i18nModel) {


        if (inputId === "buyer") {
          inputKey = "buyerTitle";
        } else if (inputId === "merchant") {
          inputKey = "merchantTitle";
        } else if (inputId === "cadNo") {
          inputKey = "cadNoTitle";
        } else if (inputId === "tech") {
          inputKey = "techTitle";
        }

        title = this.getView().getModel("i18n").getResourceBundle().getText(inputKey);
      }

      if (!this._pDynamicDialog) {
        BusyIndicator.show(0);
        this._pDynamicDialog = Fragment.load({
          id: this.getView().getId(),
          name: "stoneman.view.ValueHelpFragment",
          controller: this
        }).then(function (oDialog) {
          this.getView().addDependent(oDialog);
          oDialog.setTitle(title);
          // BusyIndicator.hide();
          return oDialog;
        }.bind(this));
      }

      // Open the dialog and add dynamic fields
      this._pDynamicDialog.then(function (oDialog) {
        this.oBusyIndicator = Fragment.byId(this.getView().getId(), "busyIndicator");

        // Show the busy indicator
        this.oBusyIndicator.setVisible(true);
        this._createTableColumnsAndRows(inputId);
        oDialog.setTitle(title);
        oDialog.open();
        //BusyIndicator.hide();
      }.bind(this));
    },

    camelCaseToSpaces: function (str) {
      return str.replace(/([a-z])([A-Z])/g, '$1 $2');
    },
    _createTableColumnsAndRows: function (inputId) {
      // Sample data
      // Clear search field value on fragment initialization
      this.byId("idSearchField").setValue("");

      WebService.getAPIForFragment(inputId).then(function (response) {
        if (response) {
          BusyIndicator.hide();
          if (that.oBusyIndicator) {
            that.oBusyIndicator.setVisible(false);
          }
        }
        if (response.code == 200) {

          var oTable = that.byId("dynamicTable");

          oTable.removeAllColumns();
          var oData = {
            columnHeaders: [],
            rows: []
          };
          if (inputId == "buyer") {
            var aData;
            var oModel = that.getView().getModel("cadBuyer");
            aData = oModel.getData();
            for (var i = 0; i <= aData.d.results.length; i++) { aData.d.results.pop(); }
            aData.d.results = [];
            for (var i = 0; i <= response.data.d.results.length; i++) {
              aData.d.results.push(response.data.d.results[i]);
            }
            oModel.setData(aData);
            that.getView().setModel(oModel, "cadBuyer");
            //oModel.setData(response.data.value);

            oData.rows = aData.d.results;
          }
          else if (inputId == "cadNo") {
            var oModel = that.getView().getModel("cadRequestModel");
            var aData = oModel.getData();
            aData.value = [];
            for (var i = 0; i < response.data.value.length; i++) {
              aData.value.push(response.data.value[i]);
            }
            that.getView().setModel(oModel, "cadRequestModel");
            oModel.setData(response.data.value);

            oModel.setData(aData);
            oData.rows = aData.value;
          }
          else if (inputId == "tech") {
            var oModel = that.getView().getModel("MUserModel");
            var aData = oModel.getData();
            aData.value = [];
            for (var i = 0; i < response.data.value.length; i++) {
              aData.value.push(response.data.value[i]);
            }
            that.getView().setModel(oModel, "MUserModel");
            oModel.setData(response.data.value);

            oModel.setData(aData);
            oData.rows = aData.value;
          }
          if (inputId == 'buyer') {
            oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
            oData.columnHeaders.push("BusinessPartnerName");
          }
          else if (inputId == 'tech') {
            oData.columnHeaders =
              [{ label: "DepartmentName", template: "DepartmentName" },
              { label: "UserRoleCode_RoleCode_RoleConstant", template: "UserRoleCode_RoleCode_RoleConstant" },
              { label: "Username", template: "Username" }
              ];
          }
          else if (inputId == 'merchant') {
            // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
            oData.columnHeaders = ["PersonFullName"];
          }
          else if (inputId == 'cadNo') {
            oData.columnHeaders =
              [{ label: "CRF", template: "CrfReqNo" },
              { label: "CrfReqUUID", template: "CrfReqUUID   ", visible: false }];
          }

          var oModel = new JSONModel(oData);
          oModel.setData(oData);
          that.getView().setModel(oModel);
          if (inputId == "buyer") {
            oData.columnHeaders.forEach(function (headerText) {
              {
                var headerText2 = that.camelCaseToSpaces(headerText);
                oTable.addColumn(new sap.m.Column({
                  header: new sap.m.Text({ text: headerText2 }).addStyleClass("columnHeaderStyle")
                }));
              }
            });
          }
          if (inputId == "cadNo") {
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
          if (inputId == "tech") {
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

          if (inputId == "buyer") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName + "}" });
            });
          }
          if (inputId == "cadNo") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName.template + "}" });
            });
          }
          if (inputId == "tech") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName.label + "}" });
            });
          }
          var oTemplate = new sap.m.ColumnListItem({
            type: "Active",
            press:
              // Call the actual handler with the event and the captured inputId parameter
              that.onRowPress.bind(that),

            cells: aCells
          });
          oTable.bindItems({
            path: "/rows",
            template: oTemplate
          });

        }
      });

      // oData.rows[0].col1=aData.value[0].BusinessPartnerName;

    },
    formatDialogTitle: function (inputId) {
      var i18nModel = this.getView().getModel("i18n");
      if (i18nModel) {
        var inputKey = inputId == "buyer" ? "buyerTitle" : "merchantTitle";
        return i18nModel.getProperty("i18n>" + inputKey);
      }
      console.log("title", inputKey);
      return "";
    },
    onValueHelpBuyer: function () {
      this.onValueHelpRequest("buyer");
      this.inputId = "buyer";
    },

    onValueHelpMerchant: function () {
      this.onValueHelpRequest("merchant");
      this.inputId = "merchant";
    },
    onValueHelpCADNo: function () {
      this.onValueHelpRequest("cadNo");
      this.inputId = "cadNo";
    },
    onValueHelpTech: function () {
      this.onValueHelpRequest("tech");
      this.inputId = "tech";
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
      var sSelectedData = oData.BusinessPartnerName; // Adjust 'field1' to the specific field you need
      var sSelectedBuyerCode = oData.BusinessPartner; // Adjust 'field1' to the specific field you need

      // Set the data to the input field

      if (this.inputId == "merchant") {
        this.byId("merchant").setValue(sSelectedData);
      } else if (this.inputId == "buyer") {
        this.byId("buyer").setValue(sSelectedData);
        buyerCode = sSelectedBuyerCode;
      } else if (this.inputId == "cadNo") {
        var sSelectedData = oData.CrfReqNo;
        this.byId("cadNo").setValue(sSelectedData);
        var uuid = oData.CrfReqUUID;
        var oModel = this.getView().getModel("cadSearchModel");
        oModel.setProperty("/cadRequuid", uuid);
      }
      else if (this.inputId == "tech") {
        var sSelectedRoleCode = oData.UserRoleCode_RoleCode_RoleConstant;
        var sSelectedTechUser = oData.Username;
        this.byId("tech").setValue(sSelectedTechUser);
        var uuid = oData.UserID;
        var oModel = this.getView().getModel("cadSearchModel");
        oModel.setProperty("/TechnoUserId_UserID", uuid);
      }

      this._pDynamicDialog.then(function (oDialog) {
        var oTable = that.byId("dynamicTable");

        oTable.removeAllColumns();
        oDialog.close();
      });
      this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);

    },
    onSearchTable: function (oEvent, oData) {
      // Get the search query
      var sQuery = oEvent.getParameter("query");
      if (sQuery == "" || sQuery == null || sQuery == undefined) {
        return;
      }
      console.log("query", sQuery);
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
      }
      // Get the binding of the table items
      var oTable = this.byId("dynamicTable");
      var oBinding = oTable.getBinding("items");
      // Combine filters using OR operator
      var oCombinedFilter = new Filter({
        filters: aFilters,
        and: false // Use 'and: false' for OR operator
      });

      // Apply the filter
      oBinding.filter(oCombinedFilter, "Application");
    },
    clearValue: function () {
      var oBuyer = this.byId("buyer");
      var oTech = this.byId("tech");
      var oStatus = this.byId("status");
      var odate = this.byId("date");
      var ocadno = this.byId("cadNo");
      oBuyer.setSelectedKey(null);
      oStatus.setSelectedKey(null);
      odate.setValue(null);
      ocadno.setValue(null);
      oTech.setValue(null);
      var oModel = this.getView().getModel("cadSearchModel");
      oModel.setProperty("/cadRequuid", "");
      oModel.setProperty("/TechnoUserId_UserID", "");
      this.getListData();
    },
    onSearch: function () {
      // Get the input field values
      var buyer = this.byId("buyer").getValue();
      var date = this.byId("date").getDateValue();
      var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
      date = oDateFormat.format(date);
      var status = this.byId("status").getSelectedKey();
      var oModel = this.getView().getModel("cadSearchModel");
      var cadNo = this.byId("cadNo").getValue();
      var techID = oModel.getProperty("/TechnoUserId_UserID");
      if ((buyer == "" || buyer == null) && (date == "" || date == null) && (status == "" || status == null) && (cadNo == "" || cadNo == null) && (techID == "" || techID == null)) {

        MessageToast.show("Please select a filter criteria.");
        return;
      }
      var filterData = {
        BUYERCODE: null,
        CRFREQNO: null,
        CRFSTATUS: null,
        CRFREQDATE: null,
        Techno: null,
        guid: userId
      }
      if (buyerCode != undefined && buyerCode != null && buyerCode != "") {
        filterData.BUYERCODE = buyerCode;
      }
      if (date != undefined && date != null && date != "") {
        filterData.CRFREQDATE = date;

      }
      if (status != undefined && status != null && status != "") {
        filterData.CRFSTATUS = status;
      }
      if (cadNo != undefined && cadNo != null && cadNo != "") {
        filterData.CRFREQNO = cadNo;
      }
      if (techID != undefined && techID != null && techID != "") {
        filterData.Techno = techID;
      }
      this.fetchFilteredData(filterData);
    },

    _getDynamicFieldName: function (oData) {

      var aKeys = [];
      if (this.inputId != "cadNo") {
        aKeys = oData.columnHeaders;

      }
      else {
        aKeys = oData.columnHeaders
          .filter(function (header) {
            return header.visible !== false;
          })
          .map(function (header) {
            return header.template;
          });

      }
      return aKeys;
    },
    fetchFilteredData: function (filterData) {
      if (filterData != undefined) {
        var filterBody = {
          guid: userId,
          BUYERCODE: filterData.BUYERCODE,
          CRFREQNO: Number(filterData.CRFREQNO),
          CRFSTATUS: filterData.CRFSTATUS,
          CRFREQDATE: filterData.CRFREQDATE,
          Techno: filterData.Techno
        };
        WebService.getFilteredTCRFSearchListAPI(filterBody).then(function (response) {
          if (response.code == 200) {
            var aData;
            var oModel = that.getView().getModel("cadRequestModel");
            aData = oModel.getData();

            aData.RETURNDATA = [];
           
            for (var i = 0; i <= response.data.value.length; i++) {
              var returnData = response.data.value[i];
              aData.RETURNDATA.push(returnData);
            }
            response.data.value.forEach(function (item) {
              item.CRFSTATUS =
                  item.CRFSTATUS == "WIP" ? "In Progress" :
                  item.CRFSTATUS == "C" ? "Cancel" :
                  item.CRFSTATUS == "CLS" ? "Close" : "New";
            })
            oModel.setData(aData);
            that.getView().setModel(oModel, "cadRequestModel");
          }
        });
      }
    },

  })
});